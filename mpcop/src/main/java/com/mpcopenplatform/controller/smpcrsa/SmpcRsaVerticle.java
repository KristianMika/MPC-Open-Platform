package com.mpcopenplatform.controller.smpcrsa;

import com.mpcopenplatform.controller.AbstractProtocolVerticle;
import com.mpcopenplatform.controller.GeneralMPCOPException;
import com.mpcopenplatform.controller.Messages;
import com.mpcopenplatform.controller.smpcrsa.client_full.ClientFullMgr;
import com.mpcopenplatform.controller.smpcrsa.server.ServerMgr;

import javax.smartcardio.ResponseAPDU;
import java.util.List;
import java.util.logging.Logger;

import static com.mpcopenplatform.controller.Util.*;


/**
 * The {@link SmpcRsaVerticle} class implements the {@link AbstractProtocolVerticle}
 *
 * @author Kristian Mika
 */
public class SmpcRsaVerticle extends AbstractProtocolVerticle {
    public static final String CONSUMER_ADDRESS = "service.smart-id-rsa";
    public static final int KEY_GENERATION_MAX_ATTEMPTS = 10;
    private static final Logger logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);
    private final ServerMgr server;
    private final ClientFullMgr client;

    public SmpcRsaVerticle() throws Exception {
        super(CONSUMER_ADDRESS);

        // Either the server or the client must run on a real card, only one simulator can be initialized at a time!
        server = new ServerMgr(false);
        client = new ClientFullMgr(true);
    }


    @Override
    protected String[] sign(String data) throws GeneralMPCOPException {

        try {
            return new String[]{server.signMessage(data, client.signMessage(data))};
        } catch (Exception e) {
            throw new GeneralMPCOPException(e.toString());
        }
    }

    @Override
    protected String decrypt(String ignored) throws GeneralMPCOPException {
        throw new GeneralMPCOPException(Messages.NOT_SUPPORTED_MESSAGE);
    }

    @Override
    protected String getPubKey() throws GeneralMPCOPException {
        List<ResponseAPDU> serverPublicModulus;

        try {
            serverPublicModulus = server.getPublicModulus();
        } catch (Exception e) {
            throw new GeneralMPCOPException("Couldn't get the public key.");
        }

        checkSw(serverPublicModulus);
        return extractData(serverPublicModulus);
    }

    @Override
    protected void reset() throws GeneralMPCOPException {
        try {
            client.reset();
            server.reset();

        } catch (Exception e) {
            throw new GeneralMPCOPException(e.toString());
        }
    }

    @Override
    protected void keygen() throws GeneralMPCOPException {

        // TODO: use a worker verticle
        ResponseAPDU resClient;
        List<ResponseAPDU> serverApdus;
        String[] clientKeys;
        boolean generated = false;
        int attemptsRemaining = KEY_GENERATION_MAX_ATTEMPTS;
        Exception lastE = null;

        while (!generated && attemptsRemaining-- > 0) {
            try {
                client.reset();
                server.reset();

                resClient = client.generateKeys();

                checkSw(resClient);

                clientKeys = client.getKeys();

                server.generateKeys();
                server.setClientKeys(clientKeys);

                serverApdus = server.getPublicModulus();

                // the "4k" check
                if (checkWrongLength(serverApdus.get(0))) {
                    logger.info("Generated moduli is not 4kb big, generating again.");
                    continue;
                }
                generated = true;
            } catch (Exception e) {
                lastE = e;
                logger.warning(e.toString());
            }
        }
        if (!generated) {
            throw new GeneralMPCOPException("Couldn't generate keys: " + lastE);
        }
    }

    @Override
    protected String getInfo() {
        return "Correct operation, but not implemented yet (getInfo)";
    }
}
