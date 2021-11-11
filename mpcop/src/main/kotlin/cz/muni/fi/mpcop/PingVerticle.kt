package cz.muni.fi.mpcop

import cz.muni.cz.mpcop.PingManager
import io.vertx.core.AbstractVerticle
import io.vertx.core.eventbus.DeliveryOptions
import io.vertx.core.eventbus.Message
import io.vertx.core.json.JsonObject
import java.util.logging.Logger

class PingVerticle : AbstractVerticle() {
    var pingManager: PingManager? = null
    private val logger: Logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)

    override fun start() {
        vertx.eventBus().consumer("service.ping") { msg: Message<String> ->

            requestHandler(msg)
        }
    }

    private fun requestHandler(msg: Message<String>) {


        logger.info("Received: " + msg.body().toString())

        val operation: PingOperation = try {
            PingOperation.valueOf(msg.body())
        } catch (e: IllegalArgumentException) {
            throw GeneralMPCOPException("Invalid operation $msg.body()")
        }

        val operationOriginTimestamp = System.currentTimeMillis()
        val response: Response? = try {
            process(operation)
        } catch (e: Exception) {
            logger.warning(e.toString())
            Response(operation.toString()).failed().setErrMessage(e.message)
        }
        val operationFinalTimestamp = System.currentTimeMillis()

        val serializedResponse: JsonObject? = response?.let { Utils.toJsonObject(it) }
        logger.info("Replying: $serializedResponse")

        val headers = msg.headers()
        headers.add("operation_origin", operationOriginTimestamp.toString())
        val options = DeliveryOptions()

        headers.add("operation_done", operationFinalTimestamp.toString())
        options.headers = headers
        msg.reply(serializedResponse, options)
    }

    @Throws(GeneralMPCOPException::class)
    fun process(operation: PingOperation): Response {
        val r = Response(operation.toString())

        return when (operation) {
            PingOperation.CONNECT -> {
                pingManager = PingManager(true)
                r.setMessage(pingManager?.pingPlayers?.size?.toString() ?: "0")
            }

            PingOperation.PING -> {
                val timestamps = pingManager?.ping()
                r.setData(timestamps.toString())
            }
        }
    }
}


