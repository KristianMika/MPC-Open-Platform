package cz.muni.fi.mpcop


import cz.muni.fi.mpcop.Utils.getUpdatesAddress
import cz.muni.fi.mpcop.myst.MystVerticle
import cz.muni.fi.mpcop.ping.PingVerticle
import cz.muni.fi.mpcop.smpcrsa.SmpcRsaVerticle
import io.vertx.core.AbstractVerticle
import io.vertx.core.eventbus.ReplyException
import io.vertx.core.eventbus.ReplyFailure
import io.vertx.core.json.JsonObject
import io.vertx.ext.bridge.BridgeEventType
import io.vertx.ext.bridge.PermittedOptions
import io.vertx.ext.web.Router
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.handler.StaticHandler
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions
import io.vertx.ext.web.handler.sockjs.SockJSHandler
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions
import io.vertx.kotlin.core.json.get
import java.net.SocketException
import java.util.concurrent.atomic.AtomicInteger
import java.util.logging.Logger


/**
 * The [ControllerVerticle] facilitates the connections from the clients
 * (runs a http server, serves static content, provides sockJsHandler)
 */
class ControllerVerticle : AbstractVerticle() {

    override fun start() {
        val server = vertx.createHttpServer()
        val router: Router = Router.router(vertx)
        val options: SockJSHandlerOptions = SockJSHandlerOptions().setHeartbeatInterval(HEART_BEAT_INTERVAL)
        val sockJSHandler: SockJSHandler = SockJSHandler.create(vertx, options)
        var bo = SockJSBridgeOptions()

        bo = addInboundPermittedAddresses(
            bo,
            listOf(
                CONTROLLER_ADDRESS,
                CONTROLLER_REGISTER_ADDRESS,
                PingVerticle.verticleAddress
            ) + PROTOCOL_ADDRESSES
        )
        bo = addOutboundPermittedAddresses(
            bo, listOf(
                CONTROLLER_REGISTER_ADDRESS
            ) + PROTOCOL_ADDRESSES.map { address -> getUpdatesAddress(address) }
        )

        bo = bo.setReplyTimeout(REPLY_TIMEOUT)

        sockJSHandler.bridge(bo) { event ->
            when (event.type()) {
                // a new client has registered
                BridgeEventType.REGISTER -> {
                    if (event.rawMessage.get<String>(messageAddressKeyName) == CONTROLLER_REGISTER_ADDRESS) {
                        logNewConnection(event.socket().remoteAddress().toString())
                    }
                }
                // a new client has disconnected
                BridgeEventType.UNREGISTER -> {
                    if (event.rawMessage.get<String>(messageAddressKeyName) == CONTROLLER_REGISTER_ADDRESS) {
                        logClosedConnection(event.socket().remoteAddress().toString())
                    }
                }
                // a client has sent a request
                BridgeEventType.SEND -> {
                    setDefaultHeaders(event.rawMessage)
                    event.rawMessage.get<JsonObject>(messageHeadersKeyName)
                        .put(backendIngresTimestampName, System.currentTimeMillis().toString())
                }
                // a verticle has responded to a request
                BridgeEventType.RECEIVE -> {
                    setDefaultHeaders(event.rawMessage)
                    event.rawMessage.get<JsonObject>(messageHeadersKeyName)
                        .put(backendEgressTimestampName, System.currentTimeMillis().toString())
                }
                else -> {
                }
            }
            event.complete(true)
        }

        // for debug purposes only, logs all internal server errors
        router.errorHandler(HttpCodes.SERVER_ERROR) { rc: RoutingContext ->
            logger.severe("An internal error has occurred: ${rc.failure().message}")
            val failure = rc.failure()
            failure?.printStackTrace()
        }

        // reroute all 404s to index.html
        router.errorHandler(
            HttpCodes.NOT_FOUND
        ) { routingContext: RoutingContext ->
            routingContext.response().setStatusCode(HttpCodes.FOUND)
                .putHeader(HTTP_LOCATION_HEADER_NAME, DEFAULT_REDIRECT_PATH).end()
        }

        router.route("$CONTROLLER_BRIDGE_PATH/*").handler(sockJSHandler)

        val staticHandler = StaticHandler.create(staticContentDir)
        router.route("/*").handler(staticHandler)

        server.requestHandler(router).listen(CONTROLLER_PORT)
        logger.info("Controller has been successfully deployed and is now running on port $CONTROLLER_PORT.")
        logger.info(getPrivateIpAnnouncement())

    }

    /**
     * Adds inbound permitted addresses to bridge [options] - address that can be reached from outside
     * the application event bus
     */
    private fun addInboundPermittedAddresses(
        options: SockJSBridgeOptions,
        addresses: List<String>
    ): SockJSBridgeOptions {
        addresses.forEach { address -> options.addInboundPermitted(PermittedOptions().setAddress(address)) }
        return options
    }

    /**
     * Add outbound permitted addresses to bridge [options] - addresses that can reach outside
     * the application event bus
     */
    private fun addOutboundPermittedAddresses(
        options: SockJSBridgeOptions,
        addresses: List<String>
    ): SockJSBridgeOptions {
        addresses.forEach { address -> options.addOutboundPermitted(PermittedOptions().setAddress(address)) }
        return options
    }

    /**
     * Sets the headers to an empty [JsonObject] in case the [rawMessage] does not contain the header field
     */
    private fun setDefaultHeaders(rawMessage: JsonObject): JsonObject {
        if (!rawMessage.containsKey(messageHeadersKeyName)) {
            rawMessage.put(messageHeadersKeyName, JsonObject())
        }
        return rawMessage
    }


    /**
     * Logs a new connection and increments the connection counter
     *
     * @param address of the new connection
     */
    private fun logNewConnection(address: String) {
        logger.info(
            "New connection from " + address
                    + "\nTotal number of connections: " + connectionCounter.incrementAndGet()
        )
    }

    /**
     * Logs a terminated connection and decrements the connection counter
     *
     * @param address of the terminated connection
     */
    private fun logClosedConnection(address: String) {
        logger.info(
            "Connection from " + address + " has been terminated."
                    + "\nTotal number of connections: " + connectionCounter.decrementAndGet()
        )
    }

    /**
     * Attempts to return an error message with hints on how to resolve the issue based on the throwable
     *
     * @param throwable used for deduction
     * @return error message with hints
     */
    private fun getErrMessage(throwable: Throwable): String {
        if (throwable is ReplyException) {
            if (throwable.failureType() == ReplyFailure.NO_HANDLERS) {
                return Messages.NO_HANDLERS_ERROR
            }
            if (throwable.failureType() == ReplyFailure.TIMEOUT) {
                return Messages.TIMEOUT_ERROR
            }
        }
        return (Messages.GENERIC_ERROR_MESSAGE + " " + throwable.toString())
    }

    /**
     * Creates an announcement containing the host's private IP address and instructions on accessing
     * the control panel from other computers.
     */
    private fun getPrivateIpAnnouncement(): String {
        var message = "You can access the control panel from computers within this LAN at "
        message += try {
            val privateIp: String = Utils.getPrivateIp()
            "$privateIp:${CONTROLLER_PORT}."
        } catch (ignored: SocketException) {
            "port $CONTROLLER_PORT of this computer."
        }
        return message
    }

    companion object {
        const val CONTROLLER_ADDRESS = "service.controller"
        const val CONTROLLER_REGISTER_ADDRESS = "service.controller-register"
        const val CONTROLLER_BRIDGE_PATH = "/mpcop-event-bus"
        val PROTOCOL_ADDRESSES = listOf(MystVerticle.CONSUMER_ADDRESS, SmpcRsaVerticle.CONSUMER_ADDRESS)

        const val backendEgressTimestampName = "backend_egress"
        const val backendIngresTimestampName = "backend_ingress"
        const val messageHeadersKeyName = "headers"
        const val messageAddressKeyName = "address"

        const val HTTP_LOCATION_HEADER_NAME = "Location"
        const val DEFAULT_REDIRECT_PATH = "/index.html"

        private const val staticContentDir: String = "./static"
        private val logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
        const val CONTROLLER_PORT = 8082
        private const val HEART_BEAT_INTERVAL: Long = 2000
        const val REPLY_TIMEOUT: Long = 60000
        var connectionCounter = AtomicInteger()

    }
}
