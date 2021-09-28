package cz.muni.fi.mpcop.myst


import cz.muni.fi.mpcop.AbstractProtocolVerticle
import cz.muni.fi.mpcop.GeneralMPCOPException
import cz.muni.fi.mpcop.Messages
import cz.muni.fi.mpcop.Utils
import mpctestclient.MPCRun
import mpctestclient.MPCRunConfig
import org.bouncycastle.util.encoders.Hex
import java.util.*


/**
 * The [MystVerticle] implements the [AbstractProtocolVerticle].
 *
 * @author Kristian Mika
 */
class MystVerticle : AbstractProtocolVerticle(CONSUMER_ADDRESS) {
    private var run: MPCRun? = null
    override fun getInfo(): String {
        return """
            Number of players: ${run?.runCfg?.numPlayers.toString()}
            Number of hosts: ${run?.hosts?.size.toString()}
            """.trimIndent()
    }

    @Throws(GeneralMPCOPException::class)
    override fun keygen() {
        try {
            run?.performKeyGen(run?.hostKeyGen)

            // TODO: only once
            run?.signCacheAll(run?.hostDecryptSign)
        } catch (e: Exception) {
            e.printStackTrace()
            throw GeneralMPCOPException(e.toString())
        }
    }

    @Throws(GeneralMPCOPException::class)
    override fun reset() {
        try {
            run?.resetAll(run?.hostFullPriv)
        } catch (e: Exception) {
            logger.info(e.toString())
            throw GeneralMPCOPException(e.toString())
        }
    }

    @Throws(GeneralMPCOPException::class)
    override fun getPubKey(): String {
            val pubkey =
                run?.yagg ?: throw GeneralMPCOPException("The public key has not been computed yet.")
            return Hex.toHexString(pubkey.getEncoded(false)).toUpperCase(Locale.ROOT)
        }

    @Throws(GeneralMPCOPException::class)
    override fun sign(data: String): List<String> {
        return try {
            val sig: String = run?.signAll(Utils.bigIntegerFromString(data), run?.hostDecryptSign)?.toString(16) ?: ""
            val sig_e: String = (run?.e ?: "") as String
            listOf(sig, sig_e)
        } catch (e: Exception) {
            logger.info(e.toString())
            throw GeneralMPCOPException(e.toString())
        }
    }

    override fun decrypt(data: String): String {
        return "Not implemented yet"
    }

    companion object {
        const val CONSUMER_ADDRESS = "service.myst"
    }

    init {
        try {
            run = MPCRun(MPCRunConfig.getDefaultConfig())
            run?.connectAll()

            // TODO: this should be done through the setup process
            run?.performSetupAll(run?.hostFullPriv)
        } catch (e: Exception) {
            logger.severe(Messages.PROTOCOL_FAILURE)
        }
    }
}
