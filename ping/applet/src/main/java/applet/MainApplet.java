package applet;

import javacard.framework.*;

public class MainApplet extends Applet implements MultiSelectable {
    private final byte INS_PING;
    private final byte[] pong;
    private final short pongLength;
    private final short paddingLength = 100;
    private static final byte CLA_PING = (byte) 0x88;

    public MainApplet(byte[] buffer, short offset, byte length) {
        INS_PING = (byte) 0x12;
        pong = new byte[] { 0x70, 0x6F, 0x6E, 0x67 };
        pongLength = (short) pong.length;
        register();
    }

    public static void install(byte[] bArray, short bOffset, byte bLength) {
        new MainApplet(bArray, bOffset, bLength);
    }

    public void process(APDU apdu) {

        if (selectingApplet())
            return;

        byte[] apduBuffer = apdu.getBuffer();
        byte cla = apduBuffer[ISO7816.OFFSET_CLA];
        byte ins = apduBuffer[ISO7816.OFFSET_INS];
        short lc = apduBuffer[ISO7816.OFFSET_LC];
        short p1 = apduBuffer[ISO7816.OFFSET_P1];
        short p2 = apduBuffer[ISO7816.OFFSET_P2];

        if (cla != CLA_PING)
            ISOException.throwIt(ISO7816.SW_CLA_NOT_SUPPORTED);

        if (ins != INS_PING) {
            ISOException.throwIt(ISO7816.SW_INS_NOT_SUPPORTED);
        }

        pong(apdu);

    }

    public void pong(APDU apdu) {
        byte[] apduBuffer = apdu.getBuffer();
        Util.arrayCopyNonAtomic(pong, (short) 0, apduBuffer, (short) 0, pongLength);
        Util.arrayFillNonAtomic(apduBuffer, pongLength, paddingLength, (byte) 0xff);
            apdu.setOutgoingAndSend((short) 0, (short) (pongLength + paddingLength));
    }

    public boolean select(boolean b) {
        return true;
    }

    public void deselect(boolean b) {

    }
}
