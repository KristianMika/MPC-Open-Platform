package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.Util.sendRequest
import cz.muni.fi.mpcop.smpcrsa.SmpcRsaVerticle
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.junit5.VertxExtension
import org.junit.jupiter.api.Assertions
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith

/**
 * The [TestSmpcRsaVerticle] test functionality of the [SmpcRsaVerticle].
 * Since we can't have the server and the client in a simulator,
 * this is all we can test
 */
@ExtendWith(VertxExtension::class)
class TestSmpcRsaVerticle(vertx: Vertx) : AsyncTest(vertx, SmpcRsaVerticle::class) {
    private val smpcRsaAddress = SmpcRsaVerticle.CONSUMER_ADDRESS
    private val protocolName = "Smart-ID-RSA"


    @Test
    fun `attempt to generate keys unconfigured`() = runTest {
        val request = Request(protocolName, Operation.KEYGEN, "")

        val response: Response = sendRequest(request, vertx, smpcRsaAddress)

        Assertions.assertFalse(response.success, "Response is not successful")
        Assertions.assertNull(response.message, "Not empty message")
        Assertions.assertNotNull(response.errMessage, "Empty error message")
        Assertions.assertEquals(Operation.KEYGEN, response.operation, "Incorrect operation")
    }

    @Test
    fun `configure Smart-ID RSA - 2 simulated players`() = runTest {
        val config = JsonObject().put("isServerSimulated", "true").put("isClientSimulated", "true")
        val request = Request(protocolName, Operation.CONFIGURE, config.toString())
        val response = sendRequest(request, vertx, smpcRsaAddress)

        Assertions.assertFalse(response.success, "Response is successful")
        Assertions.assertNull(response.message, "Not empty response message")
        Assertions.assertNotNull(response.errMessage, "Empty error message")
    }

    @Test
    fun `configure Smart-ID RSA - invalid config`() = runTest {
        val config = JsonObject().put("isServerSimulator", "true").put("isClientSimulated", "true")
        val request = Request(protocolName, Operation.CONFIGURE, config.toString())
        val response = sendRequest(request, vertx, smpcRsaAddress)

        Assertions.assertFalse(response.success, "Response is successful")
        Assertions.assertNull(response.message, "Not empty response message")
        Assertions.assertNotNull(response.errMessage, "Empty error message")
    }


}