package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.Util.sendRequest
import cz.muni.fi.mpcop.myst.MystVerticle
import io.vertx.core.Vertx
import io.vertx.core.json.JsonObject
import io.vertx.junit5.VertxExtension
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit


/**
 * The [TestMystVerticle] test the basic behaviour of [MystVerticle]
 */
@ExtendWith(VertxExtension::class)
class TestMystVerticle(vertx: Vertx) : AsyncTest(vertx, MystVerticle::class) {
    private val protocolName = "Myst"
    private val mystAddress = MystVerticle.CONSUMER_ADDRESS

    /**
     * Correctly configures Myst
     */
    private suspend fun configureMyst() {
        val config = JsonObject().put("virtualCardsCount", "1")
        val request = Request(protocolName, Operation.CONFIGURE, config.toString())
        val response = sendRequest(request, vertx, mystAddress)

        if (!response.success) {
            throw GeneralMPCOPException("Configuration has failed")
        }
    }

    /**
     * Correctly generates keys
     */
    private suspend fun generateKeys() {
        val request = Request(protocolName, Operation.KEYGEN, "")
        val response = sendRequest(request, vertx, mystAddress)
        if (!response.success) {
            throw GeneralMPCOPException("Keygen has failed")
        }
    }

    /**
     * When a [MystVerticle] is deployed, it executes the cache operation
     * In order to test the verticle properly, we have to wait a few milliseconds for caching to finish
     */
    private suspend fun waitForCaching() {

        var counter = 0
        val maxAttempts = 10
        val request = Request(protocolName, Operation.SIGN, "3da541559918a808c2402bba5012f6c60b27661c")

        do {
            val waiter = CountDownLatch(1)
            waiter.await(50, TimeUnit.MILLISECONDS)

            val response = sendRequest(request, vertx, mystAddress)
            counter += 1
        } while (response.errMessage == "Caching is required." && counter < maxAttempts)

    }


    @Test
    fun `attempt to generate keys unconfigured`() = runTest {
        val request = Request(protocolName, Operation.KEYGEN, "")

        val response: Response = sendRequest(request, vertx, mystAddress)

        assertFalse(response.success, "Response is not successful")
        assertNull(response.message, "Not empty message")
        assertNotNull(response.errMessage, "Empty error message")
        assertEquals(Operation.KEYGEN, response.operation, "Incorrect operation")

    }

    @Test
    fun `configure Myst correctly`() = runTest {
        val config = JsonObject().put("virtualCardsCount", "1")
        val request = Request(protocolName, Operation.CONFIGURE, config.toString())
        val response = sendRequest(request, vertx, mystAddress)

        assertTrue(response.success, "Response is not successful")
        assertNotNull(response.message, "Empty response message")
        assertEquals(response.errMessage, null, "Not empty error message")
        assertEquals(Operation.CONFIGURE, response.operation, "Incorrect operation")
    }

    @Test
    fun `configure Myst incorrectly`() = runTest {
        val config = JsonObject().put("virtualCardsCount", "-1")
        val request = Request(protocolName, Operation.CONFIGURE, config.toString())
        val response = sendRequest(request, vertx, mystAddress)

        assertFalse(response.success, "Response is successful")
        assertNull(response.message, "Not empty response message")
        assertNotNull(response.errMessage, "Empty error message")
    }

    @Test
    fun `generate keys configured`() = runTest {
        configureMyst()
        val request = Request(protocolName, Operation.KEYGEN, "")

        val response: Response = sendRequest(request, vertx, mystAddress)

        assertTrue(response.success, "Response is not successful")
        assertEquals(Operation.KEYGEN, response.operation, "Incorrect operation")
    }

    @Test
    fun `sign message before key generation`() = runTest {
        configureMyst()
        val request = Request(protocolName, Operation.SIGN, "")

        val response: Response = sendRequest(request, vertx, mystAddress)

        assertFalse(response.success, "Response is successful")
        assertNotNull(response.errMessage, "Error message is empty")
    }

    @Test
    fun `sign empty message`() = runTest {
        configureMyst()
        generateKeys()
        waitForCaching()

        val request = Request(protocolName, Operation.SIGN, "")
        val response: Response = sendRequest(request, vertx, mystAddress)

        assertFalse(response.success, "Response is successful")
        assertNull(response.message, "Message is empty")
        assertNotNull(response.errMessage, "Error message is not empty")
    }

    @Test
    fun `sign invalid hex string message`() = runTest {
        configureMyst()
        generateKeys()
        waitForCaching()

        val request = Request(protocolName, Operation.SIGN, "rt")
        val response: Response = sendRequest(request, vertx, mystAddress)

        assertFalse(response.success, "Response is successful")
        assertNull(response.message, "Message is not empty")
        assertNotNull(response.errMessage, "Error message is empty")
    }

    @Test
    fun `sign a valid hex string message`() = runTest {
        configureMyst()
        generateKeys()
        waitForCaching()

        val request = Request(protocolName, Operation.SIGN, "3da541559918a808c2402bba5012f6c60b27661c")
        val response: Response = sendRequest(request, vertx, mystAddress)

        val signature = response.signature

        assertNotNull(signature)
        assertTrue(response.success, "Response is not successful")
        assertNull(response.errMessage, "Error message is not empty")
        assertEquals(Operation.SIGN, response.operation, "Incorrect operation")
    }

    @Test
    fun `encrypt a valid hex string message`() = runTest {
        configureMyst()
        generateKeys()
        val request = Request(protocolName, Operation.ENCRYPT, "3da541559918a808c2402bba5012f6c60b27661c")

        val response: Response = sendRequest(request, vertx, mystAddress)

        val cipher = response.message

        assertNotNull(cipher, "Cipher is null")
        assertTrue(response.success, "Response is not successful")
        assertNull(response.errMessage, "Error message is not empty")
        assertEquals(Operation.ENCRYPT, response.operation, "Incorrect operation")
    }

    @Test
    fun `decrypt an invalid cipher`() = runTest {
        configureMyst()
        generateKeys()
        val invalidCipher =
            "092958128752522A15CB728FC1AE84F04FECCC37F3453DF6E35122CBF8C41325FCA7836933E19C61ED6B7C1FB32E3383B9355416A039DB93FF978D69A67228B084476703BB5F2B7E81994EB53BA06E2AD"
        val request = Request(protocolName, Operation.DECRYPT, invalidCipher)

        val response: Response = sendRequest(request, vertx, mystAddress)

        val plaintext = response.message

        assertNull(plaintext, "Plaintext is not null")
        assertFalse(response.success, "Response not successful")
        assertNotNull(response.errMessage, "Error message is empty")
    }

    @Test
    fun `decrypt an invalid hex string`() = runTest {
        configureMyst()
        generateKeys()
        val request = Request(protocolName, Operation.DECRYPT, "asd")

        val response: Response = sendRequest(request, vertx, mystAddress)

        val plaintext = response.message

        assertNull(plaintext, "Plaintext is not null")
        assertFalse(response.success, "Response not successful")
        assertNotNull(response.errMessage, "Error message is empty")
    }

    @Test
    fun `decrypt a valid cipher`() = runTest {
        configureMyst()
        generateKeys()
        val validCipher =
            "042C0B06859807D7DE608524FE00252E23714BFD90F67B2A2788502C74D170DFBDA4AAED2DCC7D367ED147425FFD1A7020E092958128752522A15CB728FC1AE84F04FECCC37F3453DF6E35122CBF8C41325FCA7836933E19C61ED6B7C1FB32E3383B9355416A039DB93FF978D69A67228B084476703BB5F2B7E81994EB53BA06E2AD"
        val request = Request(protocolName, Operation.DECRYPT, validCipher)

        val response: Response = sendRequest(request, vertx, mystAddress)

        val plaintext = response.message

        assertNotNull(plaintext, "Plaintext is null")
        assertTrue(response.success, "Response is not successful")
        assertNull(response.errMessage, "Error message is not empty")
        assertEquals(Operation.DECRYPT, response.operation, "Incorrect operation")
    }
}