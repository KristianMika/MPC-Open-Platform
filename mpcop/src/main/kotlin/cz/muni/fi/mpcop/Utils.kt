package cz.muni.fi.mpcop


import com.google.gson.GsonBuilder
import cz.muni.cz.mpcop.cardTools.Util.hexStringToByteArray
import io.vertx.core.json.JsonObject
import java.math.BigInteger
import java.net.DatagramSocket
import java.net.InetAddress

import java.net.SocketException


/**
 * The [Utils] class holds utility methods used in other classes
 *
 * @author Kristian Mika
 */
object Utils {


    private const val POSITIVE_SIGNUM: Int = 1

    /**
     * Creates a positive BigInteger from a hex [input] string.
     * Returns a positive BigInteger
     */
    @JvmStatic
    fun bigIntegerFromHexString(input: String): BigInteger {
        return BigInteger(POSITIVE_SIGNUM, hexStringToByteArray(input))
    }

    /**
     * Serializes the [src] input object into a JsonObject
     */
    @JvmStatic
    fun toJsonObject(src: Any): JsonObject {
        return JsonObject(GsonBuilder().create().toJson(src) ?: "")
    }

    /**
     * Serializes the [src] input object into a JSON string
     */
    @JvmStatic
    fun toJson(src: Any): String {
        return GsonBuilder().create().toJson(src) ?: ""
    }

    /**
     * Returns the private IP address of the preferred interface.
     */
    @Throws(SocketException::class)
    @JvmStatic
    fun getPrivateIp(): String {
        val targetAddress = "8.8.8.8"
        val destinationPort = 10002
        DatagramSocket().use { socket ->
            socket.connect(InetAddress.getByName(targetAddress), destinationPort)
            return socket.localAddress.hostAddress
        }
    }


    /**
     * Construct an update address from the [address] input string
     * An update address is an address that is used for protocol updates, e.g. key generation.
     * All clients are subscribed to this address and update the front-end text fields based on
     * these messages
     */
    @JvmStatic
    fun getUpdatesAddress(address: String): String {
        return "${address}-updates"
    }
}
