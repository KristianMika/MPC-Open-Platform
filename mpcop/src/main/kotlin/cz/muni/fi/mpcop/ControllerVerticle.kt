package cz.muni.fi.mpcop


import io.vertx.core.AbstractVerticle
import io.vertx.core.Handler
import io.vertx.core.eventbus.Message
import io.vertx.core.eventbus.ReplyException
import io.vertx.core.eventbus.ReplyFailure
import io.vertx.core.json.JsonObject
import io.vertx.ext.bridge.BridgeEventType
import io.vertx.ext.bridge.PermittedOptions
import io.vertx.ext.web.Router
import io.vertx.ext.web.RoutingContext
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions
import io.vertx.ext.web.handler.sockjs.SockJSHandler
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions
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
            .addOutboundPermitted(PermittedOptions().setAddress(CONTROLLER_REGISTER_ADDRESS))
            .setReplyTimeout(REPLY_TIMEOUT)
        vertx.eventBus().consumer(
            CONTROLLER_ADDRESS
        ) { msg: Message<JsonObject> ->
            vertx.eventBus()
                .request<JsonObject>(getProtocolAddress(msg), msg.body())
                .onSuccess(Handler { data: Message<JsonObject> ->
                    logger.info(
                        "Received from " + getProtocolAddress(msg) + ": " + data.body().toString()
                    )
                    msg.reply(data.body().toString())
                }).onFailure(Handler { throwable: Throwable ->
                    logger.info(Messages.REPLY_FAIL_MESSAGE + throwable.toString())
                    msg.reply(
                        Utils.toJsonObject(
                            Response("Forward request").failed().setErrMessage(getErrMessage(throwable))
                        ).toString()
                    )
                })
        }
        sockJSHandler.bridge(bo) { event ->
            when (event.type()) {
                BridgeEventType.REGISTER -> logNewConnection(event.socket().remoteAddress().toString())
                BridgeEventType.UNREGISTER -> logClosedConnection(event.socket().remoteAddress().toString())
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

        router.route("$CONTROLLER_BRIDGE_PATH/*").handler(sockJSHandler)
        server.requestHandler(router).listen(CONTROLLER_PORT)
        logger.info("Controller has been successfully deployed and is now running on port $CONTROLLER_PORT.")

    }

    /**
     * Returns the protocol address
     *
     * @param message containing the protocol
     * @return the protocol address in form "service.[protocol]"
     */
    private fun getProtocolAddress(message: Message<JsonObject>): String {
        return "service." + getProtocol(message.body())
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

    companion object {
        const val CONTROLLER_ADDRESS = "service.controller"
        const val CONTROLLER_REGISTER_ADDRESS = "service.controller-register"
        const val CONTROLLER_BRIDGE_PATH = "/mpcop-event-bus"
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
