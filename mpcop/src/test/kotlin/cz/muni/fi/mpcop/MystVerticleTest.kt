package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.myst.MystVerticle
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.junit5.VertxExtension
import io.vertx.kotlin.coroutines.await
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Timeout
import org.junit.jupiter.api.extension.ExtendWith
import java.util.concurrent.TimeUnit

@DisplayName("Myst verticle test")
@ExtendWith(VertxExtension::class)
class MystVerticleTest(vertx: Vertx) : AsyncTest(vertx, MystVerticle::class) {


    @Test
    @Timeout(5, unit = TimeUnit.SECONDS)
    fun `MystVerticle is working`(vertx: Vertx): Unit = runTest {

        val eventBus = vertx.eventBus()
        // TODO: create a request class in tests
        val request = JsonObject()
        request.put("operation", Operation.INFO.toString())
        request.put("data", "")
        val response: Response = Util.fromJson(
            eventBus.request<JsonObject>(MystVerticle.CONSUMER_ADDRESS, request).await().body().toString(),
            Response::class.java
        )

        assertTrue(response.success, "Response is not successful")
        Assertions.assertNotNull(response.message, "Empty response message")
        Assertions.assertEquals(response.errMessage, null, "Not empty error message")
        Assertions.assertEquals(Operation.INFO.toString(), response.operation, "Incorrect operation")
    }

}

