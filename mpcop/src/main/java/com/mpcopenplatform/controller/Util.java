package com.mpcopenplatform.controller;

import com.google.gson.GsonBuilder;

import javax.smartcardio.ResponseAPDU;
import java.math.BigInteger;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.List;

import static com.mpcopenplatform.controller.smpcrsa.cardTools.Util.toHex;


/**
 * The {@link Util} class holds utility methods used in other classes
 *
 * @author Kristian Mika
 */
public class Util {
    public static final int SW_NO_ERROR = 0x9000;
    public static final int SW_WRONG_LENGTH = 0x6700;

    /**
     * Creates a positive BigInteger from a string
     *
     * @param input string
     * @return a positive BigInteger created from the input string
     */
    public static BigInteger BigIntegerFromString(String input) {
        return new BigInteger(1, input.getBytes());
    }


    /**
     * Serializes the input object to JSON
     *
     * @param src object to be serialized
     * @return the result JSON object as a string
     */
    public static String toJson(Object src) {
        return new GsonBuilder().create().toJson(src);
    }

    /**
     * Returns the private IP address of the preferred interface.
     *
     * @return ip address
     * @throws SocketException      if a socket can't be open
     * @throws UnknownHostException if the IP address can't be determined
     */
    public static String getPrivateIp() throws SocketException, UnknownHostException {
        final String targetAddress = "8.8.8.8";
        final int destinationPort = 10002;
        try (final DatagramSocket socket = new DatagramSocket()) {
            socket.connect(InetAddress.getByName(targetAddress), destinationPort);
            return socket.getLocalAddress().getHostAddress();
        }
    }

    /**
     * Checks the status word of the returned apdu response from a card
     *
     * @param apdu that contains the status word
     * @throws GeneralMPCOPException if the status word != 0x9000 (OK)
     */
    public static void checkSw(ResponseAPDU apdu) throws GeneralMPCOPException {
        if (apdu.getSW() != SW_NO_ERROR) {
            throw new GeneralMPCOPException(String.format("A card returned an error: 0x%04X", apdu.getSW()));
        }
    }

    /**
     * Check the status word of all of the returned responses from a card
     *
     * @param apdus that contain status words
     * @throws GeneralMPCOPException if any status word != 0x9000 (OK)
     */
    public static void checkSw(List<ResponseAPDU> apdus) throws GeneralMPCOPException {
        for (ResponseAPDU apdu : apdus) {
            checkSw(apdu);
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
    public static String extractData(List<ResponseAPDU> apdus) {
        StringBuilder data = new StringBuilder();
        for (ResponseAPDU r : apdus) {
            data.append(toHex(r.getData()));
        }
        return data.toString();
    }
}
