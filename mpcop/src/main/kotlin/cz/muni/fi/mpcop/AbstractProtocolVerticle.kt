package cz.muni.fi.mpcop

import com.google.gson.JsonElement
import com.google.gson.JsonParser

import cz.muni.fi.mpcop.Messages.KEYS_NOT_GENERATED_YET
import cz.muni.fi.mpcop.Messages.MISSING_DATA_ERROR
import cz.muni.fi.mpcop.Messages.UNCONFIGURED_PROTOCOL_ERROR
import cz.muni.fi.mpcop.Utils.getUpdatesAddress
import cz.muni.fi.mpcop.Utils.toJsonObject

import io.vertx.core.AbstractVerticle
import io.vertx.core.eventbus.DeliveryOptions
import io.vertx.core.eventbus.Message
import io.vertx.core.json.JsonObject
import io.vertx.kotlin.core.json.get
import java.util.logging.Logger

/**
 * The [AbstractProtocolVerticle] class represents
 * a base class for all MPCOP protocols.
 */
abstract class AbstractProtocolVerticle(private val CONSUMER_ADDRESS: String) : AbstractVerticle() {
    protected val logger: Logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
    private val state: ProtocolState = ProtocolState()
    private var isProtocolConfigured: Boolean = false
    var areKeysGenerated: Boolean = false

    /**
     * The [ExecutionResponse] class encapsulates a response to a specific request and a publish event
     * A publish event is an event that should be published to all connected clients subscribed to the
     * protocol's subscription address. An example of such an event is the key generation publish event.
     */
    private data class ExecutionResponse(val response: Response, val publishEvent: Operation?) {
        constructor(response: Response) : this(response, null)
    }

    private fun requestHandler(msg: Message<JsonObject>) {
        logger.info("Received: ${msg.body()}")
        val operationOriginTimestamp = System.currentTimeMillis()
        val (response, publishEvent) = try {
            process(msg.body() as JsonObject)
        } catch (e: GeneralMPCOPException) {
            logger.warning(e.toString())
            ExecutionResponse(Response().failed().setErrMessage(e.message))
        } catch (e:Exception) {
            logger.severe("Unknown error occured")
            ExecutionResponse(Response().failed().setErrMessage(e.message))
        }

        val operationFinalTimestamp = System.currentTimeMillis()
        val serializedResponse: JsonObject = toJsonObject(response)
        logger.info("Replying: $serializedResponse")
        val options = DeliveryOptions()
        options.headers = msg.headers()
        options.addHeader(operationOriginTimestampName, operationOriginTimestamp.toString())
        options.addHeader(operationDoneTimestampName, operationFinalTimestamp.toString())
        msg.reply(serializedResponse, options)

        if (publishEvent != null) {
            val (publishResponse, _) = executeOperation(publishEvent)
            vertx.eventBus().publish(getUpdatesAddress(CONSUMER_ADDRESS), toJsonObject(publishResponse))
        }
    }

    override fun start() {
        vertx.eventBus().consumer(CONSUMER_ADDRESS) { msg: Message<JsonObject> ->
            requestHandler(msg)
        }
    }

    /**
     * Processes a [request] and calls the correct method.
     * Returns the result of the requested operation
     */
    @Throws(GeneralMPCOPException::class)
    private fun process(request: JsonObject): ExecutionResponse {
        val rawOperation: String = request.getString(operationKeyName)
        val operation: Operation = try {
            Operation.valueOf(rawOperation)
        } catch (e: IllegalArgumentException) {
            throw GeneralMPCOPException("Invalid operation $rawOperation")
        }

        // in case the protocol has not been configured yet,
        // allow only CONFIGURE and GET_CONFIG operations
        if (!isProtocolConfigured && (operation != Operation.CONFIGURE && operation != Operation.GET_CONFIG)) {
            return ExecutionResponse(Response(operation).failed().setErrMessage(UNCONFIGURED_PROTOCOL_ERROR))
        }

        val data = request.get<String>(dataKeyName)
        return executeOperation(operation, data)
    }

    @Throws(GeneralMPCOPException::class)
    private fun executeOperation(operation: Operation, data: String? = null): ExecutionResponse {
        var publishEvent: Operation? = null
        var r = Response(operation)
        r = when (operation) {
            Operation.INFO -> r.setMessage(getInfo())
            Operation.KEYGEN -> {
                state.pubKey = null
                keygen()
                val pubkey = getPubKey()
                state.pubKey = pubkey
                areKeysGenerated = true
                publishEvent = Operation.GET_PUBKEY
                r.setPublicKey(pubkey)
            }
            Operation.RESET -> {
                state.pubKey = null
                reset()
                areKeysGenerated = false
                publishEvent = Operation.RESET
                r.setMessage(Messages.CARDS_RESET_SUCCESSFUL)
            }
            Operation.GET_PUBKEY -> {
                val pubkey = state.pubKey ?: getPubKey()
                state.pubKey = pubkey
                r.setPublicKey(pubkey)
            }
            Operation.DECRYPT -> {
                checkAreKeysGenerated()
                if (data == null) {
                    throw GeneralMPCOPException(MISSING_DATA_ERROR)
                }
                r.setMessage(decrypt(data))
            }
            Operation.ENCRYPT -> {
                checkAreKeysGenerated()
                if (data == null) {
                    throw GeneralMPCOPException(MISSING_DATA_ERROR)
                }

                if (state.pubKey == null) {
                    throw GeneralMPCOPException(KEYS_NOT_GENERATED_YET)
                }
                r.setMessage(encrypt(data, state.pubKey as String))
            }
            Operation.SIGN -> {
                checkAreKeysGenerated()
                if (data == null) {
                    throw GeneralMPCOPException(MISSING_DATA_ERROR)
                }
                r.setSignatures(sign(data))
            }
            Operation.CONFIGURE -> {
                val configuration = JsonParser.parseString(data)
                val configResult = configure(configuration)
                isProtocolConfigured = true
                areKeysGenerated = areKeysGenerated()
                publishEvent = Operation.GET_CONFIG
                r.setMessage(configResult)
            }
            Operation.GET_CONFIG -> r.setMessage(getConfig())
        }
        return ExecutionResponse(r, publishEvent)
    }

    @Throws(GeneralMPCOPException::class)
    private fun checkAreKeysGenerated() {
        if (!areKeysGenerated) {
            throw GeneralMPCOPException(KEYS_NOT_GENERATED_YET)
        }
    }

    /**
     * Serves the sign request - signs the input [data] string
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun sign(data: String): List<String>

    /**
     * Servers the decrypt request - decrypts the encrypted [data]
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun decrypt(data: String): String


    /**
     * Server the encrypt request - encrypts the plaintext [data] with the provided [pubKey]
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun encrypt(data: String, pubKey: String): String

    /**
     * Servers the "get public key" request - returns the public key
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun getPubKey(): String

    /**
     * Serves the reset request - reset the protocol and invalidates all cryptographic secrets
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun reset()

    /**
     * Serves the "generate keys" request - generates keys.
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun keygen()

    /**
     * Serves the "get info" request - Returns information about the protocol run,
     * e.g. the number of participants, the current protocol state, etc.
     */
    protected abstract fun getInfo(): String

    /**
     * Configures the protocol - e.g. sets the number of participants
     * Returns the protocol configuration
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun configure(conf: JsonElement): String

    /**
     * Returns the current protocol configuration
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun getConfig(): String

    /**
     * Is used to detect if the keys have been already generated and operations
     * that require keys to be generated may be allowed. It is used especially for case when a newly connected
     * cards have already performed key generation in one of the previous MPCOP runs
     */
    protected abstract fun areKeysGenerated(): Boolean

    /**
     * Verifies [inputString] as a hex string
     */
    @Throws(GeneralMPCOPException::class)
    fun verifyInputHexString(inputString: String) {
        if (inputString.isEmpty()) {
            throw GeneralMPCOPException("Input data cannot be empty")
        }

        if (!Utils.verifyHexString(inputString)) {
            throw GeneralMPCOPException("Invalid data format")
        }
    }

    companion object {
        const val operationOriginTimestampName = "operation_origin"
        const val operationDoneTimestampName = "operation_done"
        const val operationKeyName = "operation"
        const val dataKeyName = "data"
    }
}
