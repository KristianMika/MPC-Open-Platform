package cz.muni.fi.mpcop.myst


import com.google.gson.Gson
import com.google.gson.JsonElement
import com.google.gson.JsonSyntaxException
import cz.muni.cz.mpcop.cardTools.Util
import cz.muni.fi.mpcop.AbstractProtocolVerticle
import cz.muni.fi.mpcop.GeneralMPCOPException
import cz.muni.fi.mpcop.Messages.DECRYPTION_FAILED
import cz.muni.fi.mpcop.Messages.ENCRYPTION_FAILED
import cz.muni.fi.mpcop.Messages.GENERIC_ERROR_MESSAGE
import cz.muni.fi.mpcop.Messages.INVALID_FORMAT
import cz.muni.fi.mpcop.Messages.KEYS_NOT_GENERATED_YET
import cz.muni.fi.mpcop.Messages.ZERO_PLAYERS_WARNING
import cz.muni.fi.mpcop.Utils.bigIntegerFromHexString
import cz.muni.fi.mpcop.Utils.toJson
import mpctestclient.MPCRun
import mpctestclient.MPCRunConfig
import org.bouncycastle.util.encoders.Hex
import java.math.BigInteger
import java.util.*


/**
 * The [MystVerticle] class represents the Myst protocol
 */
class MystVerticle : AbstractProtocolVerticle(CONSUMER_ADDRESS) {
    private var run: MPCRun? = null
    private var config = MystConfiguration(virtualCardsCount = DEFAULT_VIRTUAL_CARDS_COUNT)

    override fun getInfo(): String {
        return """
            The current number of players: ${run?.runCfg?.allPlayersCount.toString()}
            """.trimIndent()
    }

    @Throws(GeneralMPCOPException::class)
    override fun configure(conf: JsonElement): String {

        val config = MPCRunConfig.getDefaultConfig()
        val mystConfig: MystConfiguration = try {
            Gson().fromJson(conf, MystConfiguration::class.java)
        } catch (e: JsonSyntaxException) {
            throw GeneralMPCOPException(INVALID_FORMAT)
        }

        config.simulatedPlayersCount = mystConfig.virtualCardsCount

        try {
            run = MPCRun(config)
            run?.connectAll()

            if (run?.runCfg?.allPlayersCount == 0) {
                throw GeneralMPCOPException(ZERO_PLAYERS_WARNING)
            }

        } catch (e: Exception) {
            throw GeneralMPCOPException(e.message ?: e.toString())
        }
        this.config = mystConfig
        return getInfo()
    }

    override fun getConfig(): String {
        return toJson(config)
    }

    override fun areKeysGenerated(): Boolean {
        return run?.areKeysGenerated() == true
    }

    @Throws(GeneralMPCOPException::class)
    override fun keygen() {
        try {
            run?.resetAll(run?.hostFullPriv)
            run?.performSetupAll(run?.hostFullPriv)
            run?.performKeyGen(run?.hostKeyGen)
            signCache()
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
            run?.yagg ?: throw GeneralMPCOPException(KEYS_NOT_GENERATED_YET)
        return Hex.toHexString(pubkey.getEncoded(false)).uppercase(Locale.ROOT)
    }

    @Throws(GeneralMPCOPException::class)
    override fun sign(data: String): List<String> {
        return try {
            val sig: String? = run?.signAll(bigIntegerFromHexString(data), run?.hostDecryptSign)?.toString(HEX_ENCODING)
            val sigE: String? = run?.e
            if (sig == null || sigE == null) {
                throw GeneralMPCOPException(GENERIC_ERROR_MESSAGE)
            }
            signCache()
            listOf(sig, sigE)
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
        return try {
            Util.toHex(run?.decryptAll(Util.hexStringToByteArray(data), run?.hostDecryptSign)?.getEncoded(false))
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.message ?: DECRYPTION_FAILED)
        }
    }

    override fun encrypt(data: String, pubKey: String): String {
        return try {
            Util.toHex(run?.encryptOnHost(BigInteger(1, Util.hexStringToByteArray(data))))
        } catch (e: Exception) {
            throw GeneralMPCOPException(e.message ?: ENCRYPTION_FAILED)
        }
    }

    companion object {
        const val CONSUMER_ADDRESS = "service.myst"
        const val DEFAULT_VIRTUAL_CARDS_COUNT: Short = 5
        const val HEX_ENCODING = 16
    }

    init {
        val runConfig = MPCRunConfig.getDefaultConfig()
        runConfig.simulatedPlayersCount = config.virtualCardsCount
    }
}
