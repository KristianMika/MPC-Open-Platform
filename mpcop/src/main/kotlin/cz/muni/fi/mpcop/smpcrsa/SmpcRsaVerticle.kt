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
import cz.muni.fi.mpcop.Utils


/**
 * The [SmpcRsaVerticle] class implements the [AbstractProtocolVerticle]
 *
 * @author Kristian Mika
 */
class SmpcRsaVerticle :
    AbstractProtocolVerticle(CONSUMER_ADDRESS) {

    private var server: ServerMgr
    private var client: ClientFullMgr
    private var config: SmpcRsaConfiguration


    @Throws(GeneralMPCOPException::class)
    override fun sign(data: String): List<String> {
        return try {
            listOf(server.signMessage(data, client.signMessage(data)))
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        }
    }

    @Throws(GeneralMPCOPException::class)
    override fun decrypt(data: String): String {
        return try {
            server.signMessage(data, client.signMessage(data))
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        }
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
                throw GeneralMPCOPException("The public key has not been computed yet.")
            }
        return response
    }

    @Throws(GeneralMPCOPException::class)
    override fun reset() {
        try {
            client.reset()
            server.reset()
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        }
    }

    override fun getConfig(): String {
        return Utils.toJson(config)
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
            throw GeneralMPCOPException("Invalid format")
        }


        if (config.isServerSimulated != newConfig.isServerSimulated) {
            server.reset()
            server = ServerMgr(!newConfig.isServerSimulated)
        }

        if (config.isClientSimulated != newConfig.isClientSimulated) {
            server.reset()
            client = ClientFullMgr(!newConfig.isClientSimulated)
        }
        config = newConfig

        return getInfo()
    }

    companion object {
        const val CONSUMER_ADDRESS = "service.smart-id-rsa"
        const val KEY_GENERATION_MAX_ATTEMPTS = 10

    }

    init {
        config = SmpcRsaConfiguration(isServerSimulated = true, isClientSimulated = false)

        // Either the server or the client must run on a real card, only one simulator can be initialized at a time!
        server = ServerMgr(!config.isServerSimulated)
        client = ClientFullMgr(!config.isClientSimulated)


    }
}