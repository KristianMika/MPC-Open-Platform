package cz.muni.cz.mpcop.smpcrsa;

import cz.muni.cz.mpcop.smpcrsa.client_full.ClientFullMgr;
import cz.muni.cz.mpcop.smpcrsa.server.ServerMgr;
import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.ResponseAPDU;
import java.math.BigInteger;
import java.util.List;

import static cz.muni.cz.mpcop.JavaCardUtils.*;

/**
 * The {@link SmpcRsa} class contains methods that require direct communication with JavaCards
 *
 * @author Kristian Mika
 */
public class SmpcRsa {

    /**
     * Requests the public modulus from a server
     *
     * @param server - The server that contains the public modulus
     * @return the public modulus as a hex string
     * @throws Exception if something fails
     */
    static public String getPubkey(ServerMgr server) throws Exception {
        List<ResponseAPDU> serverPublicModulus;
        try {
            serverPublicModulus = server.getPublicModulus();
        } catch (Exception e) {
            throw new GeneralMPCOPException("Couldn't get the public key.");
        }
        checkSw(serverPublicModulus);
        return extractData(serverPublicModulus);
    }

    /**
     * Executes the whole collaborative key generation process.
     *
     * @param client  - The Smart-ID RSA client
     * @param server- The Smart-ID RSA server
     * @throws GeneralMPCOPException if something fails
     */
    public static void keygen(ClientFullMgr client, ServerMgr server) throws GeneralMPCOPException {
        List<ResponseAPDU> serverApdus;
        String[] clientKeys;
        try {
            client.reset();
            server.reset();

            client.generateKeys();
            clientKeys = client.getKeys();

            server.generateKeys();
            server.setClientKeys(clientKeys);

            serverApdus = server.getPublicModulus();

            // the "4k" check
            if (checkWrongLength(serverApdus.get(0))) {
                throw new GeneralMPCOPException("Couldn't generate keys: The generated moduli is not 4kb in size.");
            }
            server.handleError(serverApdus.get(0), "Get public modulus");
            server.handleError(serverApdus.get(1), "Get public modulus");

        } catch (Exception e) {
            throw new GeneralMPCOPException(e.getMessage());
        }
    }

    /**
     * Encrypts a message
     *
     * @param message       - The message to be encrypted as a hex string
     * @param publicModulus - The public modulus as a hex string
     * @return - Encrypted message as a hex string
     */
    public static String encrypt(String message, String publicModulus) {

        BigInteger e = new BigInteger(1, new byte[]{0x01, 0x00, 0x01}); //65537

        BigInteger n = new BigInteger(publicModulus, 16);
        BigInteger m = new BigInteger(message, 16);

        return m.modPow(e, n).toString(16);
    }

}
