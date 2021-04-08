package com.mpcopenplatform.controller.smpcrsa;

import com.mpcopenplatform.controller.AbstractProtocolVerticle;
import com.mpcopenplatform.controller.GeneralMPCOPException;
import com.mpcopenplatform.controller.Messages;
import com.mpcopenplatform.controller.smpcrsa.cardTools.Util;
import com.mpcopenplatform.controller.smpcrsa.client_full.ClientFullMgr;
import com.mpcopenplatform.controller.smpcrsa.server.ServerMgr;

import javax.smartcardio.ResponseAPDU;
import java.util.List;
import java.util.logging.Logger;


/**
 * TODO: refactor!
 * TODO: throw exceptions instead of returning error messages (consider refactor of {@link AbstractProtocolVerticle}
 *
 */
public class SmpcRsaVerticle extends AbstractProtocolVerticle {
    public static final String CONSUMER_ADDRESS = "service.smart-id-rsa";
    private static final Logger logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    // Either server or client must run on a real card, only one simulator can be initialized at a time!
    private final ServerMgr server = new ServerMgr(false);
    private final ClientFullMgr client = new ClientFullMgr(true);

    public SmpcRsaVerticle() throws Exception {
        super(CONSUMER_ADDRESS);
    }


    @Override
    protected String sign(String data) {
        try {
            return server.signMessage(data, client.signMessage(data));

        } catch (Exception e) {
            e.printStackTrace();
            return Messages.ERROR_MESSAGE;
        }

    }

    protected String decrypt(String ignored) {
        return Messages.NOT_SUPPORTED_MESSAGE;
    }

    @Override
    protected String getPubKey() {
        List<ResponseAPDU> serverPublicModulus;

        try {
            serverPublicModulus = server.getPublicModulus();

        } catch (Exception e) {
            e.printStackTrace();
            logger.warning("Couldn't get the public key.");
            //throw new GeneralMPCOPException("Couldn't get the public key.");
            return Messages.ERROR_MESSAGE;
        }

        if (serverPublicModulus.get(0).getSW() != AbstractMgr.SW_NO_ERROR) {
            throw new IllegalArgumentException("not good");
        }

        StringBuilder modulus = new StringBuilder();
        for (ResponseAPDU r : serverPublicModulus) {
            modulus.append(Util.toHex(r.getData()));
        }
        return modulus.toString();
    }

    @Override
    protected String reset() {
        try {
            client.reset();
            server.reset();

        } catch (Exception e) {
            e.printStackTrace();
            return Messages.ERROR_MESSAGE;
        }
        return "Cards have been successfully reset";
    }

    @Override
    protected String keygen() {

        // TODO: use worker node
        ResponseAPDU res;
        ResponseAPDU resClient;
        String[] clientKeys;
        boolean generated = false;
        String pubkey = "";
        while (!generated) {

            try {
                client.reset();
                server.reset();

                resClient = client.generateKeys();

                if (resClient.getSW() != AbstractMgr.SW_NO_ERROR) {
                    throw new IllegalArgumentException("not 0x9000");
                }

                clientKeys = client.getKeys();


                server.reset();
                server.generateKeys();
                server.setClientKeys(clientKeys);
                pubkey = getPubKey();
                generated = true;
            } catch (Exception e) {
                e.printStackTrace();
            }

        }

        return pubkey;
    }

    @Override
    protected String getInfo() {
        return "Correct operation, but not implemented yet (getInfo)";
    }
}
