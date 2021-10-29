package cz.muni.fi.mpcop

import com.google.gson.JsonElement
import com.google.gson.JsonParser
import cz.muni.fi.mpcop.Utils.toJsonObject

import io.vertx.core.AbstractVerticle
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
    protected val logger: Logger
    protected val state: ProtocolState = ProtocolState()

    private fun requestHandler(msg: Message<JsonObject>) {
        logger.info("Received: " + msg.body().toString())
        val response: Response? = try {
            process(msg.body() as JsonObject)
        } catch (e: GeneralMPCOPException) {
            logger.warning(e.toString())
            Response("Protocol initialization").failed().setErrMessage(e.message)
        }
        val serializedResponse: JsonObject? = response?.let { toJsonObject(it) }
        logger.info("Replying: $serializedResponse")
        msg.reply(serializedResponse)
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
        val r: Response = Response(operation)
        return when (operation) {
            Operation.INFO -> r.setMessage(getInfo())
            Operation.KEYGEN -> {
                state.pubKey = null
                keygen()
                val pubkey = getPubKey()
                state.pubKey = pubkey
                r.setPublicKey(pubkey)
            }
            Operation.RESET -> {
                state.pubKey = null
                reset()
                r.setMessage(Messages.CARDS_RESET_SUCCESSFUL)
            }
            Operation.GET_PUBKEY -> {
                val pubkey = state.pubKey ?: getPubKey()
                state.pubKey = pubkey
                r.setPublicKey(pubkey)
            }
            Operation.DECRYPT -> {
                val data: String = request.getString("data")
                r.setMessage(decrypt(data))
            }
            Operation.ENCRYPT -> {
                val data: String = request.getString("data")
                // TODO: pubkey can't be empty
                r.setMessage(encrypt(data, state.pubKey?:""))
            }
            Operation.SIGN -> r.setSignatures(sign(request.getString("data")))
            Operation.CONFIGURE -> r.setMessage(configure(JsonParser.parseString(request.getString("data"))))
            Operation.GET_CONFIG -> r.setMessage(getConfig())
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

    init {
        logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
    }
}
