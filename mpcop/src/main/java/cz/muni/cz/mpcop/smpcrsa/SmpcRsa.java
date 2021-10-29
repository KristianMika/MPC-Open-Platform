package cz.muni.cz.mpcop.smpcrsa;

import cz.muni.cz.mpcop.cardTools.Util;
import cz.muni.cz.mpcop.smpcrsa.client_full.ClientFullMgr;
import cz.muni.cz.mpcop.smpcrsa.server.ServerMgr;
import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.ResponseAPDU;
import java.math.BigInteger;
import java.util.List;

import static cz.muni.cz.mpcop.JavacardUtils.*;
import static cz.muni.fi.mpcop.smpcrsa.SmpcRsaVerticle.KEY_GENERATION_MAX_ATTEMPTS;

public class SmpcRsa {

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

    public static void keygen(ClientFullMgr client, ServerMgr server) throws Exception {
        ResponseAPDU clientResponse;
        List<ResponseAPDU> serverApdus;
        String[] clientKeys;
        boolean generated = false;
        int attemptsRemaining =
                KEY_GENERATION_MAX_ATTEMPTS;
        Exception lastE = null;
        while (!generated && attemptsRemaining-- > 0) {
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
                    //logger.info("Generated moduli is not 4kb big, generating again.")
                    continue;
                }
                generated = true;
            } catch (Exception e) {
                lastE = e;
                //logger.warning(e.toString())
            }
        }
        if (!generated) {
            throw new GeneralMPCOPException("Couldn't generate keys: " + lastE);
        }
    }

    public static String encrypt(String message, String publicModulus) {

        BigInteger e = new BigInteger(1, new byte[]{0x01, 0x00, 0x01}); //65537
        BigInteger n = new BigInteger(1, Util.hexStringToByteArray(publicModulus));
        BigInteger m = new BigInteger(1, Util.hexStringToByteArray(message));

        return m.modPow(e, n).toString(16);
    }
}
