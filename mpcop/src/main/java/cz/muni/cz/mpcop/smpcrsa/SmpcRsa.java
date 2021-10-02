package cz.muni.cz.mpcop.smpcrsa;

import cz.muni.cz.mpcop.smpcrsa.client_full.ClientFullMgr;
import cz.muni.cz.mpcop.smpcrsa.server.ServerMgr;
import cz.muni.fi.mpcop.GeneralMPCOPException;

import javax.smartcardio.ResponseAPDU;
import java.util.Collections;
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
        List<ResponseAPDU> resClient;
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
                resClient = Collections.singletonList(client.generateKeys());
                checkSw(resClient);
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
}
