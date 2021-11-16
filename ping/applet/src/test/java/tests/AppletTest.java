package tests;

import cardTools.CardType;
import org.junit.Assert;
import org.junit.jupiter.api.*;

import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;
import java.util.Arrays;

/**
 * Example test class for the applet
 * Note: If simulator cannot be started try adding "-noverify" JVM parameter
 *
 * @author xsvenda, Dusan Klinec (ph4r05)
 */
public class AppletTest extends BaseTest {
    byte[] pong = new byte[] { 0x70, 0x6F, 0x6E, 0x67 };
    private final short paddingLength = 100;

    public AppletTest() {
        // Change card type here if you want to use physical card

        // setCardType(CardType.PHYSICAL);
        // setCardType(CardType.REMOTE);
        setCardType(CardType.JCARDSIMLOCAL);
    }

    @BeforeAll
    public static void setUpClass() throws Exception {
    }

    @AfterAll
    public static void tearDownClass() throws Exception {
    }

    @BeforeEach
    public void setUpMethod() throws Exception {
    }

    @AfterEach
    public void tearDownMethod() throws Exception {
    }

    @Test
    public void ping() throws Exception {
        final CommandAPDU cmd = new CommandAPDU(0x88, 0x12, 0, 0);
        final ResponseAPDU responseAPDU = connect().transmit(cmd);
        Assert.assertNotNull(responseAPDU);
        Assert.assertEquals(0x9000, responseAPDU.getSW());
        byte[] bytes = responseAPDU.getData();
        Assert.assertArrayEquals(pong, Arrays.copyOfRange(bytes, 0, 4));
        Assert.assertEquals(pong.length + paddingLength, bytes.length);
    }
}
