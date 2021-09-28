package cz.muni.fi.mpcop.smpcrsa

import cz.muni.cz.mpcop.smpcrsa.SmpcRsa
import cz.muni.cz.mpcop.smpcrsa.SmpcRsa.getPubkey
import cz.muni.cz.mpcop.smpcrsa.client_full.ClientFullMgr
import cz.muni.cz.mpcop.smpcrsa.server.ServerMgr
import cz.muni.fi.mpcop.AbstractProtocolVerticle
import cz.muni.fi.mpcop.GeneralMPCOPException



/**
 * The [SmpcRsaVerticle] class implements the [AbstractProtocolVerticle]
 *
 * @author Kristian Mika
 */
class SmpcRsaVerticle :
    AbstractProtocolVerticle(CONSUMER_ADDRESS) {

    private val server: ServerMgr
    private val client: ClientFullMgr


    @Throws(GeneralMPCOPException::class)
    override fun sign(data: String): List<String> {
        return try {
            listOf(server.signMessage(data, client.signMessage(data)))
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        }
    }


    override fun decrypt(data: String): String {
        TODO("Not yet implemented")
    }


    @Throws(GeneralMPCOPException::class)
    override fun getPubKey(): String {
        return getPubkey(server)
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

    @Throws(GeneralMPCOPException::class)
    override fun keygen() {
        return SmpcRsa.keygen(client, server)
    }

    override fun getInfo(): String {
        return "Correct operation, but not implemented yet (getInfo)"
    }

    companion object {
        const val CONSUMER_ADDRESS = "service.smart-id-rsa"
        const val KEY_GENERATION_MAX_ATTEMPTS = 10

    }

    init {
        // Either the server or the client must run on a real card, only one simulator can be initialized at a time!
        server = ServerMgr(false)
        client = ClientFullMgr(true)
    }
}