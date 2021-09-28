package cz.muni.fi.mpcop


import com.google.gson.GsonBuilder
import io.vertx.core.json.JsonObject
import java.math.BigInteger


/**
 * The [Utils] class holds utility methods used in other classes
 *
 * @author Kristian Mika
 */
object Utils {


    private const val POSITIVE_SIGNUM: Int = 1

    /**
     * Creates a positive BigInteger from a string
     *
     * @param input string
     * @return a positive BigInteger created from the input string
     */
    @JvmStatic
    fun bigIntegerFromString(input: String): BigInteger {
        return BigInteger(POSITIVE_SIGNUM, input.toByteArray())
    }

    /**
     * Serializes the input object into a JsonObject
     *
     * @param src object to be serialized
     * @return the result JSON
     */
    @JvmStatic
    fun toJsonObject(src: Any): JsonObject {
        return JsonObject(GsonBuilder().create().toJson(src) ?: "")
    }

    /**
     * Serializes the input object into a JSON string
     *
     * @param src object to be serialized
     * @return the result JSON object as a string
     */
    @JvmStatic
    fun toJson(src: Any): String {
        return GsonBuilder().create().toJson(src) ?: ""
    }


}
