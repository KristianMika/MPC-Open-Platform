package cz.muni.cz.mpcop.smpcrsa;


import cz.muni.cz.mpcop.cardTools.CardManager;
import cz.muni.cz.mpcop.cardTools.RunConfig;
import cz.muni.cz.mpcop.cardTools.Util;

import javax.smartcardio.CardException;
import javax.smartcardio.CommandAPDU;
import javax.smartcardio.ResponseAPDU;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * General instruction handler of the RSA applets
 * Note: If simulator cannot be started try adding "-noverify" JVM parameter
 *
 * @author based on work by Petr Svenda, Dusan Klinec (ph4r05)
 * @author Lukas Zaoral
 * modified by Kristian Mika
 */
public abstract class AbstractMgr {


    public static final byte P2_PART_0 = 0x00;
    public static final byte P2_PART_1 = 0x01;
    public static final byte P2_SINGLE = 0x00;
    public static final byte P2_DIVIDED = 0x10;

    public static final byte NONE = 0x00;


    public static final short ARR_LENGTH = 256;
    public static final short MAX_APDU_LENGTH = 0xFF;

    public static final int SW_NO_ERROR = 0x9000;

    private final CardManager cardMgr;

    /**
     * Creates connection to the {@code applet} applet
     *
     * @param appletID applet ID
     * @param applet   applet class
     * @param realCard decides whether to use real card or emulator
     * @throws Exception if card error occurs
     */
    public AbstractMgr(String appletID, Class applet, boolean realCard) throws Exception {
        cardMgr = new CardManager(Util.hexStringToByteArray(appletID));
        final RunConfig runCfg = RunConfig.getDefaultConfig();

        if (realCard)
            runCfg.setTestCardType(RunConfig.CARD_TYPE.PHYSICAL);
        else {
            runCfg.setAppletToSimulate(applet)
                    .setTestCardType(RunConfig.CARD_TYPE.JCARDSIMLOCAL)
                    .setbReuploadApplet(true)
                    .setInstallData(new byte[8]);
        }

        System.out.print("Connecting to card...");
        if (!cardMgr.Connect(runCfg)) {
            throw new CardException("Couldn't connect to the card.");
        }

        System.out.println(" Done.");
    }

    /**
     * Takes care of segmentation of given {@code num} byte array.
     *
     * @param num byte array
     * @param cla cla byte
     * @param ins ins byte
     * @param p1  p1 byte
     * @return list of commands
     */
    protected static List<CommandAPDU> setNumber(byte[] num, byte cla, byte ins, byte p1) {
        List<CommandAPDU> cmds = new ArrayList<>();

        if (num.length <= MAX_APDU_LENGTH) {
            cmds.add(new CommandAPDU(cla, ins, p1, P2_PART_0 | P2_SINGLE, num));
            return cmds;
        }

        for (int i = num.length; i > 0; i -= MAX_APDU_LENGTH) {
            cmds.add(new CommandAPDU(
                    cla, ins, p1, (i / MAX_APDU_LENGTH > 0 ? P2_PART_0 : P2_PART_1) | P2_DIVIDED,
                    Arrays.copyOfRange(num, Math.max(i - MAX_APDU_LENGTH, 0), i)
            ));
        }

        return cmds;
    }

    /**
     * Sends given command
     *
     * @param cmd command
     * @return response
     * @throws Exception if IO or card error occurs
     */
    public ResponseAPDU transmit(CommandAPDU cmd) throws Exception {
        return cardMgr.transmit(cmd);
    }

    /**
     * Toggles debug messages
     *
     * @param isDebug truth value
     */
    public void setDebug(boolean isDebug) {
        cardMgr.setbDebug(isDebug);
    }

    /**
     * Transmits given commands and check their result
     *
     * @param cmd       commands
     * @param operation name of the opration
     * @throws Exception if IO or card error occurs
     */
    protected void transmitNumber(List<CommandAPDU> cmd, String operation) throws Exception {
        for (CommandAPDU c : cmd) {
            handleError(transmit(c), operation);
        }
    }

    /**
     * Checks the result of given response.
     *
     * @param res       response
     * @param operation name fo the operation
     * @throws CardException if the command did not end successfully
     */
    protected void handleError(ResponseAPDU res, String operation) throws CardException {
        if (res.getSW() != SW_NO_ERROR)
            throw new CardException(String.format("%s: %d", operation, res.getSW()));
    }
}
