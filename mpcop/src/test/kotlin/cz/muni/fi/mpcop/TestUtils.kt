package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.Utils.bigIntegerFromHexString
import cz.muni.fi.mpcop.Utils.getUpdatesAddress
import cz.muni.fi.mpcop.Utils.verifyHexString
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import java.math.BigInteger

class TestUtils {

    @Test
    fun `verifyHexString() detects invalid hex strings`() {
        assertFalse(verifyHexString("a"))
        assertFalse(verifyHexString("as"))
        assertFalse(verifyHexString("a s"))
    }

    @Test
    fun `verifyHexString() validates correct hex strings`() {
        assertTrue(verifyHexString("3da541559918a808c2402bba5012f6c60b27661c"))
        assertTrue(verifyHexString("0123456789abcdef"))
    }

    @Test
    fun `getUpdatesAddress() returns a valid update address`() {
        val address = "address"
        val correctUpdatesAddress = "address-updates"
        assertEquals(correctUpdatesAddress, getUpdatesAddress(address), "Invalid updates address")
    }

    @Test
    fun `bigIntegerFromHexString() returns a valid bigInteger`() {
        val oneHex = "01"
        val oneBigInteger = BigInteger.ONE
        assertEquals(oneBigInteger, bigIntegerFromHexString(oneHex), "Does not equal to one")
    }
}