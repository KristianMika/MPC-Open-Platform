package cz.muni.fi.mpcop

import com.google.gson.Gson
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.kotlin.coroutines.await


/**
 * The [Util] object contains utility functions used for all tests
 */
object Util {
    /**
     * Deserializes a string into a [T] class
     */
    fun <T> fromJson(json: String?, clazz: Class<T>?): T {
        return Gson().fromJson(json, clazz)
    }

    /**
     * Sends a [request] using the event bus to the specified [address]
     */
    suspend fun sendRequest(request: Request, vertx: Vertx, address: String): Response {
        return fromJson(
            vertx.eventBus().request<JsonObject>(address, Utils.toJsonObject(request)).await()
                .body().toString(),
            Response::class.java
        )
    }
}
