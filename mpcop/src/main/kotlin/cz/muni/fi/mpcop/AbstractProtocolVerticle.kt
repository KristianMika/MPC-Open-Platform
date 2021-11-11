package cz.muni.fi.mpcop

import com.google.gson.JsonElement
import com.google.gson.JsonParser
import cz.muni.fi.mpcop.Utils.toJsonObject

import io.vertx.core.AbstractVerticle
import io.vertx.core.eventbus.DeliveryOptions
import io.vertx.core.eventbus.Message
import io.vertx.core.json.JsonObject
import java.util.logging.Logger

// TODO: remove @param and @return tags
// TODO: unify vertx.json and google.gson usage
/**
 * The [AbstractProtocolVerticle] class represents
 * a base class for all MPCOP protocols.
 *
 * @author Kristian Mika
 */
abstract class AbstractProtocolVerticle(protected val CONSUMER_ADDRESS: String) : AbstractVerticle() {
    protected val logger: Logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
    private val state: ProtocolState = ProtocolState()
    var isProtocolConfigured: Boolean = false
    var areKeysGenerated: Boolean = false

    private fun requestHandler(msg: Message<JsonObject>) {
        logger.info("Received: " + msg.body().toString())
        val operationOriginTimestamp = System.currentTimeMillis()
        val response: Response? = try {
            process(msg.body() as JsonObject)
        } catch (e: GeneralMPCOPException) {
            logger.warning(e.toString())
            Response("Protocol initialization").failed().setErrMessage(e.message)
        }
        val operationFinalTimestamp = System.currentTimeMillis()
        val serializedResponse: JsonObject? = response?.let { toJsonObject(it) }
        logger.info("Replying: $serializedResponse")
        val options = DeliveryOptions()
        for ((key, value) in msg.headers()) {
            options.addHeader(key, value)
        }
        options.addHeader("operation_origin", operationOriginTimestamp.toString())
        options.addHeader("operation_done", operationFinalTimestamp.toString())
        msg.reply(serializedResponse, options)
    }

    override fun start() {
        vertx.eventBus().consumer(CONSUMER_ADDRESS) { msg: Message<JsonObject> ->
            requestHandler(msg)
        }
    }

    /**
     * Processes a request and calls the correct method.
     *
     * @param request to be processed
     * @return the result of the requested operation
     * @throws GeneralMPCOPException if the requested operation is not valid
     */
    @Throws(GeneralMPCOPException::class)
    fun process(request: JsonObject): Response {
        val rawOperation: String = request.getString("operation")
        val operation: Operation = try {
            Operation.valueOf(rawOperation)
        } catch (e: IllegalArgumentException) {
            throw GeneralMPCOPException("Invalid operation $rawOperation")
        }
        val r = Response(operation)

        // in case the protocol has not been configured yet,
        // allow only CONFIGURE and GET_CONFIG operations
        if (!isProtocolConfigured && (operation != Operation.CONFIGURE && operation != Operation.GET_CONFIG)) {
            return r.failed().setErrMessage("The protocol has not been configured yet.")
        }

        return when (operation) {
            Operation.INFO -> r.setMessage(getInfo())
            Operation.KEYGEN -> {
                state.pubKey = null
                keygen()
                val pubkey = getPubKey()
                state.pubKey = pubkey
                areKeysGenerated = true
                r.setPublicKey(pubkey)
            }
            Operation.RESET -> {
                state.pubKey = null
                reset()
                areKeysGenerated = false
                r.setMessage(Messages.CARDS_RESET_SUCCESSFUL)
            }
            Operation.GET_PUBKEY -> {
                val pubkey = state.pubKey ?: getPubKey()
                state.pubKey = pubkey
                r.setPublicKey(pubkey)
            }
            Operation.DECRYPT -> {
                checkAreKeysGenerated()
                val data: String = request.getString("data")
                r.setMessage(decrypt(data))
            }
            Operation.ENCRYPT -> {
                checkAreKeysGenerated()
                val data: String = request.getString("data")
                // TODO: pubkey can't be empty
                r.setMessage(encrypt(data, state.pubKey ?: ""))
            }
            Operation.SIGN -> {
                checkAreKeysGenerated()
                r.setSignatures(sign(request.getString("data")))
            }
            Operation.CONFIGURE -> {
                val configuration = JsonParser.parseString(request.getString("data"))
                val configResult = configure(configuration)
                isProtocolConfigured = true
                areKeysGenerated = areKeysGenerated()
                r.setMessage(configResult)
            }
            Operation.GET_CONFIG -> r.setMessage(getConfig())
        }
    }

    @Throws(GeneralMPCOPException::class)
    private fun checkAreKeysGenerated() {
        if (!areKeysGenerated) {
            throw GeneralMPCOPException("The keys have not been generated yet")
        }
    }

    /**
     * Serves the sign request - signs the input data string
     *
     * @param data to be signed
     * @return all parts of the signature in a string array
     * @throws GeneralMPCOPException if signing fails
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun sign(data: String): List<String>

    /**
     * Servers the decrypt request - decrypts the encrypted data
     *
     * @param data to be decrypted
     * @return the plaintext
     * @throws GeneralMPCOPException if decryption fails
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun decrypt(data: String): String


    @Throws(GeneralMPCOPException::class)
    protected abstract fun encrypt(data: String, pubKey: String): String

    /**
     * Servers the "get public key" request - returns the public key
     *
     * @return the public key of the protocol
     * @throws GeneralMPCOPException if fails
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun getPubKey(): String

    /**
     * Serves the reset request - reset the protocol and invalidates all cryptographic secrets
     *
     * @throws GeneralMPCOPException if resetting fails
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun reset()

    /**
     * Serves the "generate keys" request - generates keys.
     *
     * @throws GeneralMPCOPException if generation fails
     */
    @Throws(GeneralMPCOPException::class)
    protected abstract fun keygen()

    /**
     * Serves the "get info" request - Returns information about the protocol run,
     * e.g. the number of participants, the current protocol state, etc.
     *
     * @return protocol information
     */
    protected abstract fun getInfo(): String

    /**
     * Configures the protocol - e.g. sets the number of participants
     *
     * @return protocol configuration
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
}
