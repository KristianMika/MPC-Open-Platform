package cz.muni.fi.mpcop.smpcrsa

import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonSyntaxException
import cz.muni.cz.mpcop.smpcrsa.SmpcRsa
import cz.muni.cz.mpcop.smpcrsa.SmpcRsa.getPubkey
import cz.muni.cz.mpcop.smpcrsa.client_full.ClientFullMgr
import cz.muni.cz.mpcop.smpcrsa.server.ServerMgr
import cz.muni.fi.mpcop.AbstractProtocolVerticle
import cz.muni.fi.mpcop.GeneralMPCOPException
import cz.muni.fi.mpcop.Messages.CONFIG_HAS_FAILED
import cz.muni.fi.mpcop.Messages.GENERIC_ERROR_MESSAGE
import cz.muni.fi.mpcop.Messages.INVALID_FORMAT
import cz.muni.fi.mpcop.Messages.KEYS_NOT_GENERATED_YET
import cz.muni.fi.mpcop.Utils


/**
 * The [SmpcRsaVerticle] class represents the Smart-ID RSA protocol
 */
class SmpcRsaVerticle :
    AbstractProtocolVerticle(CONSUMER_ADDRESS) {

    private var server: ServerMgr?
    private var client: ClientFullMgr?
    private var config: SmpcRsaConfiguration


    @Throws(GeneralMPCOPException::class)
    override fun sign(data: String): List<String> {

        val signature = try {
            server?.signMessage(data, client?.signMessage(data))
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        } ?: throw GeneralMPCOPException(GENERIC_ERROR_MESSAGE)
        return listOf(signature)
    }

    @Throws(GeneralMPCOPException::class)
    override fun decrypt(data: String): String {
        return try {
            server?.signMessage(data, client?.signMessage(data))
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        } ?: throw GeneralMPCOPException(GENERIC_ERROR_MESSAGE)
    }

    override fun encrypt(data: String, pubKey: String): String {
        return SmpcRsa.encrypt(data, pubKey)
    }

    @Throws(GeneralMPCOPException::class)
    override fun getPubKey(): String {
        val response: String =
            try {
                getPubkey(server)
            } catch (e: java.lang.Exception) {
                logger.warning(e.toString())
                throw GeneralMPCOPException(KEYS_NOT_GENERATED_YET)
            }
        return response
    }

    @Throws(GeneralMPCOPException::class)
    override fun reset() {
        try {
            client?.reset()
            server?.reset()
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        }
    }

    override fun getConfig(): String {
        return Utils.toJson(config)
    }

    override fun areKeysGenerated(): Boolean {
        return try {
            // if get pubkey won't fail, it means the keys have been generated
            getPubKey()
            true
        } catch (e: Exception) {
            false
        }
    }

    @Throws(GeneralMPCOPException::class)
    override fun keygen() {
        return SmpcRsa.keygen(client, server)
    }

    override fun getInfo(): String {
        return config.toString()
    }

    override fun configure(conf: JsonElement): String {
        val newConfig: SmpcRsaConfiguration = try {
            Gson().fromJson(conf, SmpcRsaConfiguration::class.java)
        } catch (e: JsonSyntaxException) {
            throw GeneralMPCOPException(INVALID_FORMAT)
        }

        try {
            server = ServerMgr(!newConfig.isServerSimulated)
            client = ClientFullMgr(!newConfig.isClientSimulated)
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.message ?: CONFIG_HAS_FAILED)
        }
        config = newConfig
        return getInfo()
    }

    companion object {
        const val CONSUMER_ADDRESS = "service.smart-id-rsa"
    }

    init {
        // Either the server or the client must run on a real card, only one simulator can be initialized at a time!
        config = SmpcRsaConfiguration(isServerSimulated = true, isClientSimulated = false)

        server = null
        client = null
    }
}