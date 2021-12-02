package cz.muni.fi.mpcop

import io.vertx.core.Vertx
import io.vertx.core.http.HttpMethod
import io.vertx.junit5.VertxExtension
import io.vertx.kotlin.coroutines.await
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

/**
 * The [TestControllerVerticle] test basic behaviour of [ControllerVerticle]
 */
@ExtendWith(VertxExtension::class)
class TestControllerVerticle(vertx: Vertx) : AsyncTest(vertx, ControllerVerticle::class) {

    @Test
    fun `can serve index(dot)html`() = runTest {
        val request =
            httpClient.request(HttpMethod.GET, ControllerVerticle.CONTROLLER_PORT, "127.0.0.1", "/index.html").await()
        val response = request.send().await()
        assertEquals(200, response.statusCode(), "Did not return 200")
    }

    @Test
    fun `can redirect from root to index(dot)html`() = runTest {
        val request = httpClient.request(HttpMethod.GET, ControllerVerticle.CONTROLLER_PORT, "127.0.0.1", "/").await()
        val response = request.send().await()
        assertEquals(301, response.statusCode(), "Did not return 301")
        assertEquals("/index.html", response.getHeader("location"), "Did not redirect to /index.html")
    }

    @Test
    fun `can redirect from an invalid address to index(dot)html`() = runTest {
        val request = httpClient.request(
            HttpMethod.GET,
            ControllerVerticle.CONTROLLER_PORT,
            "127.0.0.1",
            "/this_address_definitely_does_not_exist"
        ).await()
        val response = request.send().await()
        assertEquals(302, response.statusCode(), "Did not return 302")
        println(response.headers())
        assertEquals("/index.html", response.getHeader("location"), "Did not redirect to /index.html")
    }
}