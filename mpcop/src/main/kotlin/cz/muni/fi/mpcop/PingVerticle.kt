package cz.muni.fi.mpcop

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonSyntaxException
import cz.muni.cz.mpcop.PingManager
import io.vertx.core.AbstractVerticle
import io.vertx.core.eventbus.DeliveryOptions
import io.vertx.core.eventbus.Message
import io.vertx.core.json.JsonObject

import java.util.logging.Logger

class PingVerticle : AbstractVerticle() {
    var pingManager: PingManager? = null
    private val logger: Logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
    private val gson = Gson()
    override fun start() {
        vertx.eventBus().consumer("service.ping") { msg: Message<JsonObject> ->

            requestHandler(msg)
        }
    }

    private fun requestHandler(msg: Message<JsonObject>) {

        logger.info("Received: " + msg.body().toString())

        val operationOriginTimestamp = System.currentTimeMillis()
        val response: Response? = try {
            process(msg.body())
        } catch (e: Exception) {
            logger.warning(e.toString())
            Response("Ping operation").failed().setErrMessage(e.message)
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
    fun process(rawRequest: JsonObject): Response {

        val request:PingRequest = try {
            gson.fromJson(rawRequest.toString(), PingRequest::class.java)
        }  catch (e:JsonSyntaxException) {
            throw GeneralMPCOPException("Invalid request format")
        }
        val r = Response(request.operation.toString())

        return when (request.operation) {
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


