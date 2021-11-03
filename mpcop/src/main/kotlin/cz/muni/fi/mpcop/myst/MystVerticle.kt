package cz.muni.fi.mpcop.myst


import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonSyntaxException
import cz.muni.cz.mpcop.cardTools.Util
import cz.muni.fi.mpcop.AbstractProtocolVerticle
import cz.muni.fi.mpcop.GeneralMPCOPException
import cz.muni.fi.mpcop.Utils
import cz.muni.fi.mpcop.Utils.toJson
import mpctestclient.MPCRun
import mpctestclient.MPCRunConfig
import org.bouncycastle.util.encoders.Hex
import java.math.BigInteger
import java.util.*


/**
 * The [MystVerticle] implements the [AbstractProtocolVerticle].
 *
 * @author Kristian Mika
 */
class MystVerticle : AbstractProtocolVerticle(CONSUMER_ADDRESS) {
    private var run: MPCRun? = null
    private var config = MystConfiguration(virtualCardsCount = 5)
    override fun getInfo(): String {
        return """
            Number of players: ${run?.runCfg?.numPlayers.toString()}
            """.trimIndent()
    }

    @Throws(GeneralMPCOPException::class)
    override fun configure(conf: JsonElement): String {

        val config = MPCRunConfig.getDefaultConfig()
        val mystConfig: MystConfiguration = try {
            Gson().fromJson(conf, MystConfiguration::class.java)
        } catch (e: JsonSyntaxException) {
            throw GeneralMPCOPException("Invalid format")
        }
        // TODO: simualted players != all players

        run?.resetAll(run?.hostFullPriv)
        config.numPlayers = mystConfig.virtualCardsCount


        try {
            run = MPCRun(config)
            run?.connectAll()

            // TODO: this should be done through the setup process
            run?.performSetupAll(run?.hostFullPriv)

        } catch (e: Exception) {
            throw GeneralMPCOPException(e.toString())
        }
        this.config = mystConfig
        return getInfo()
    }

    override fun getConfig(): String {
        return toJson(config)
    }

    @Throws(GeneralMPCOPException::class)
    override fun keygen() {
        try {
            run?.performKeyGen(run?.hostKeyGen)

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
            run?.performSetupAll(run?.hostFullPriv)
        } catch (e: Exception) {
            logger.info(e.toString())
            throw GeneralMPCOPException(e.toString())
        }
    }

    @Throws(GeneralMPCOPException::class)
    override fun getPubKey(): String {
        val pubkey =
            run?.yagg ?: throw GeneralMPCOPException("The public key has not been computed yet.")
        return Hex.toHexString(pubkey.getEncoded(false)).uppercase(Locale.ROOT)
    }

    @Throws(GeneralMPCOPException::class)
    override fun sign(data: String): List<String> {
        return try {
            val sig: String = run?.signAll(Utils.bigIntegerFromString(data), run?.hostDecryptSign)?.toString(16) ?: ""
            val sig_e: String = (run?.e ?: "") as String
            signCache()
            listOf(sig, sig_e)
        } catch (e: Exception) {
            logger.info(e.toString())
            throw GeneralMPCOPException(e.toString())
        }
    }


    /**
     * Generates random elements used in the signing phase in the background - does not block the main thread
     */
    private fun signCache() {
        vertx.setTimer(1) { _ ->
            if (run?.isCachingRequired == true) {
                run?.signCacheAll(run?.hostFullPriv)
            }
        }
    }

    override fun decrypt(data: String): String {
        return Util.toHex(run?.decryptAll(Util.hexStringToByteArray(data), run?.hostDecryptSign)?.getEncoded(false))
    }

    override fun encrypt(data: String, pubKey: String): String {

        return Util.toHex(run?.encrypt(BigInteger(1, Util.hexStringToByteArray(data)), run?.hostFullPriv))
    }

    companion object {
        const val CONSUMER_ADDRESS = "service.myst"
    }

    init {
        val runConfig = MPCRunConfig.getDefaultConfig()
        // TODO: virtual cards count != all players
        runConfig.numPlayers = config.virtualCardsCount
    }
}
