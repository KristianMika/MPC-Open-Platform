package cz.muni.fi.mpcop


import io.vertx.core.AbstractVerticle
import io.vertx.core.eventbus.ReplyException
import io.vertx.core.eventbus.ReplyFailure
import io.vertx.core.json.JsonObject
import io.vertx.ext.bridge.BridgeEventType
import io.vertx.ext.bridge.PermittedOptions
import io.vertx.ext.web.Router
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.handler.StaticHandler
import io.vertx.ext.web.handler.sockjs.BridgeEvent
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions
import io.vertx.ext.web.handler.sockjs.SockJSHandler
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions
import io.vertx.kotlin.core.json.get
import java.net.SocketException
import java.util.concurrent.atomic.AtomicInteger
import java.util.logging.Logger


/**
 * The [ControllerVerticle] runs a http server, serves static content
 * and forwards requests to other protocol verticles
 *
 * @author Kristian Mika
 */
class ControllerVerticle : AbstractVerticle() {

    override fun start() {
        val server = vertx.createHttpServer()
        val router: Router = Router.router(vertx)
        val options: SockJSHandlerOptions = SockJSHandlerOptions().setHeartbeatInterval(HEART_BEAT_INTERVAL)
        val sockJSHandler: SockJSHandler = SockJSHandler.create(vertx, options)
        val bo: SockJSBridgeOptions = SockJSBridgeOptions()
            .addInboundPermitted(PermittedOptions().setAddress(CONTROLLER_ADDRESS))
            .addInboundPermitted(PermittedOptions().setAddress(CONTROLLER_REGISTER_ADDRESS))
            .addInboundPermitted(PermittedOptions().setAddress("service.ping"))
            .addInboundPermitted(PermittedOptions().setAddress("service.myst"))
            .addOutboundPermitted(PermittedOptions().setAddress("service.myst-updates"))
            .addInboundPermitted(PermittedOptions().setAddress("service.smart-id-rsa"))
            .addOutboundPermitted(PermittedOptions().setAddress("service.smart-id-rsa-updates"))
            .addOutboundPermitted(PermittedOptions().setAddress("protocol-updates"))
            .addOutboundPermitted(PermittedOptions().setAddress(CONTROLLER_REGISTER_ADDRESS))
            .setReplyTimeout(REPLY_TIMEOUT)

        sockJSHandler.bridge(bo) { event ->
            when (event.type()) {
                BridgeEventType.REGISTER -> {
                    if (event.rawMessage.get<String>("address") == CONTROLLER_REGISTER_ADDRESS) {
                        logNewConnection(event.socket().remoteAddress().toString())
                    }
                }
                BridgeEventType.UNREGISTER -> {
                    if (event.rawMessage.get<String>("address") == CONTROLLER_REGISTER_ADDRESS) {
                        logClosedConnection(event.socket().remoteAddress().toString())
                    }
                }
                BridgeEventType.SEND -> {
                    setDefaultHeaders(event)
                    event.rawMessage.get<JsonObject>("headers")
                        .put("backend_ingress", System.currentTimeMillis().toString())
                }
                BridgeEventType.RECEIVE -> {
                    setDefaultHeaders(event)
                    event.rawMessage.get<JsonObject>("headers")
                        .put("backend_egress", System.currentTimeMillis().toString())
                }
                else -> {
                }
            }
            event.complete(true)
        }

        // for debug purposes only
        router.errorHandler(500) { rc: RoutingContext ->
            logger.severe("An internal error has occurred: $rc")
            val failure = rc.failure()
            failure?.printStackTrace()
        }

        router.errorHandler(
            404
        ) { routingContext: RoutingContext ->
            routingContext.response().setStatusCode(302).putHeader("Location", "/index.html").end()
        }

        router.route("$CONTROLLER_BRIDGE_PATH/*").handler(sockJSHandler)

        val staticHandler = StaticHandler.create(staticContentDir)
        router.route("/*").handler(staticHandler)

        server.requestHandler(router).listen(CONTROLLER_PORT)
        logger.info("Controller has been successfully deployed and is now running on port $CONTROLLER_PORT.")
        logger.info(getPrivateIpAnnouncement())

    }

    private fun setDefaultHeaders(event: BridgeEvent): BridgeEvent {
        if (!event.rawMessage.containsKey("headers")) {
            event.rawMessage.put("headers", JsonObject())
        }
        return event
    }

    /**
     * Calculates the duration of the operation based on the [originTime] and the current time
     * and sets the duration field in the [response] json object
     */
    private fun setDuration(response: JsonObject, originTime: Long): JsonObject {
        val duration = System.currentTimeMillis() - originTime
        response.put("duration", duration)
        return response
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

        // TODO: tmp fix, use config
        private const val staticContentDir: String = "../../../../../../www/mpcop/static"
        private val logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
        private const val CONTROLLER_PORT = 8082
        private const val HEART_BEAT_INTERVAL: Long = 2000
        const val REPLY_TIMEOUT: Long = 60000
        var connectionCounter = AtomicInteger()

        /**
         * Extracts the protocol from the message
         *
         * @param message to be used for extraction
         * @return the protocol
         */
        private fun getProtocol(message: JsonObject): String {
            return message.getString("protocol")
        }
    }
}
