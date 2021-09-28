package cz.muni.cz.mpcop;

import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.ResponseAPDU;
import java.util.List;

import static cz.muni.cz.mpcop.cardTools.Util.toHex;

public class JavacardUtils {
    private final static int SW_NO_ERROR = 0x9000;
    private static final int SW_WRONG_LENGTH =  0x6700;

    /**
     * Checks the status word of the returned apdu response from a card
     *
     * @param apdus that contains the status word
     * @throws GeneralMPCOPException if the status word != 0x9000 (OK)
     */
    public static void checkSw(List<ResponseAPDU> apdus) throws GeneralMPCOPException {
        for (ResponseAPDU apdu : apdus) {
            checkSw(apdu);
        }
    }

    public static void checkSw(ResponseAPDU apdu) throws GeneralMPCOPException {
        if (apdu.getSW() != SW_NO_ERROR) {
            throw new GeneralMPCOPException(String.format("A card returned an error: 0x%04X", apdu.getSW()));
        }
    }

    /**
     * Checks if the card has returned the "SW_WRONG_LENGTH" status word.
     *
     * @param apdu that contains the status word
     * @return true if the status word == SW_WRONG_LENGTH, else otherwise
     */
    public static boolean checkWrongLength(ResponseAPDU apdu) {
        return apdu.getSW() == SW_WRONG_LENGTH;
    }

    /**
     * Extracts returned data from a list of APDU responses
     *
     * @param apdus that hold data
     * @return extracted data as a string
     */
    public  static String extractData(List<ResponseAPDU> apdus) {
        StringBuilder data = new StringBuilder();
        for (ResponseAPDU r : apdus) {
            data.append(toHex(r.getData()));
        }
        return data.toString();
    }
}

