package cz.muni.fi.mpcop.ping

import com.google.gson.Gson
import com.google.gson.JsonSyntaxException
import cz.muni.cz.mpcop.PingManager
import cz.muni.fi.mpcop.GeneralMPCOPException
import cz.muni.fi.mpcop.Messages.GENERIC_ERROR_MESSAGE
import cz.muni.fi.mpcop.Messages.INVALID_REQUEST_FORMAT_ERROR
import cz.muni.fi.mpcop.Utils
import io.vertx.core.AbstractVerticle
import io.vertx.core.MultiMap
import io.vertx.core.eventbus.DeliveryOptions
import io.vertx.core.eventbus.Message
import io.vertx.core.json.JsonObject

import java.util.logging.Logger

/**
 * The [PingVerticle] class is used for performance testing.
 * It uses the [PingManager] for communication with JavaCards.
 */
class PingVerticle : AbstractVerticle() {
    var pingManager: PingManager? = null
    private val logger: Logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
    private val gson = Gson()
    override fun start() {
        vertx.eventBus().consumer(verticleAddress) { msg: Message<JsonObject> ->
            processRequest(msg)
        }
    }

    /**
     * Processes the request [msg] and replies to the reply address
     * using the request-reply vertnx messaging pattern
     */
    private fun processRequest(msg: Message<JsonObject>) {

        logger.info("Received: ${msg.body()}")

        val operationOriginTimestamp = System.currentTimeMillis()

        val response: PingResponse? = try {
            executeOperation(msg.body())
        } catch (e: Exception) {
            logger.warning(e.toString())
            PingResponse().failed().setErrMessage(e.message ?: GENERIC_ERROR_MESSAGE)
        }
        val operationFinalTimestamp = System.currentTimeMillis()

        // serialize the Response object into a JsonObject
        val serializedResponse: JsonObject? = response?.let { Utils.toJsonObject(it) }

        val options = setHeaders(msg.headers(), operationOriginTimestamp, operationFinalTimestamp)
        logger.info("Replying: $serializedResponse")
        msg.reply(serializedResponse, options)
    }

    /**
     * Returns an instance of [DeliveryOptions] with headers of the request message and
     * operation duration timestamps
     */
    private fun setHeaders(
        headers: MultiMap,
        operationOriginTimestamp: Long,
        operationFinalTimestamp: Long
    ): DeliveryOptions {
        headers.add(operationOriginTimestampName, operationOriginTimestamp.toString())
        headers.add(operationDoneTimestampName, operationFinalTimestamp.toString())
        val options = DeliveryOptions()
        options.headers = headers
        return options
    }

    /**
     * Executes the requested operation and returns the response
     */
    @Throws(GeneralMPCOPException::class)
    fun executeOperation(rawRequest: JsonObject): PingResponse {

        val request: PingRequest = try {
            gson.fromJson(rawRequest.toString(), PingRequest::class.java)
        } catch (e: JsonSyntaxException) {
            throw GeneralMPCOPException(INVALID_REQUEST_FORMAT_ERROR)
        }
        val r = PingResponse(request.operation)

        return when (request.operation) {
            PingOperation.CONNECT -> {
                pingManager = PingManager()
                r.setMessage(pingManager?.pingPlayers?.size?.toString() ?: "0")
            }

            PingOperation.PING -> {
                val timestamps = pingManager?.ping()
                r.setData(timestamps.toString())
            }
        }
    }

    companion object {
        const val verticleAddress = "service.ping"
        const val operationOriginTimestampName = "operation_origin"
        const val operationDoneTimestampName = "operation_done"
    }
}


