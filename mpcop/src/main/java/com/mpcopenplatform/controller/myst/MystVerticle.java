package com.mpcopenplatform.controller.myst;

import com.mpcopenplatform.controller.AbstractProtocolVerticle;
import com.mpcopenplatform.controller.ControllerVerticle;
import com.mpcopenplatform.controller.GeneralMPCOPException;
import com.mpcopenplatform.controller.Util;
import mpctestclient.MPCRun;
import mpctestclient.MPCRunConfig;
import org.bouncycastle.util.encoders.Hex;

import java.util.Locale;


/**
 * The {@link MystVerticle} receives requests from the {@link ControllerVerticle},
 * executes them and returns the result.
 *
 * @author Kristian Mika
 */
public class MystVerticle extends AbstractProtocolVerticle {
    public static final String CONSUMER_ADDRESS = "service.myst";
    private MPCRun run;


    public MystVerticle() {
        super(CONSUMER_ADDRESS);
        try {
            this.run = new MPCRun(MPCRunConfig.getDefaultConfig());
            run.connectAll();

            // TODO: will do the operator
            run.performSetupAll(run.hostFullPriv);

        } catch (Exception e) {
            logger.severe("Can not instantiate MPC run");
        }


    }

    @Override
    protected String getInfo() {

        return "Number of players: " + run.runCfg.numPlayers + "\n" +
                "Number of hosts: " + run.hosts.size() + "\n" +
                "Yagg: " + getPubKey() + "\n";
    }

    @Override
    protected void keygen() throws GeneralMPCOPException {
        try {
            run.performKeyGen(run.hostKeyGen);

            // TODO: only once
            run.signCacheAll(run.hostDecryptSign);


        } catch (Exception e) {
            e.printStackTrace();
            // TODO
            throw new GeneralMPCOPException(e.toString());
        }

    }

    @Override
    protected void reset() throws GeneralMPCOPException {

        try {
            run.resetAll(run.hostFullPriv);
        } catch (Exception e) {
            logger.info(e.toString());
            throw new GeneralMPCOPException(e.toString());
        }
    }


    @Override
    protected String getPubKey() {
        try {
            return Hex.toHexString(run.getYagg().getEncoded(false)).toUpperCase(Locale.ROOT);
        } catch (Exception e) {
            e.printStackTrace();
            // TODO
            return "Not known yet";
        }
    }

    @Override
    protected String[] sign(String data) throws GeneralMPCOPException {
        try {
            String sig = run.signAll(Util.BigIntegerFromString(data), run.hostDecryptSign).toString(16);
            String sig_e = run.getE();
            return new String[]{sig, sig_e};

        } catch (Exception e) {
            logger.info(e.toString());
            throw new GeneralMPCOPException(e.toString());
        }
    }

    @Override
    protected String decrypt(String data) {
        return "Not implemented yet";
    }
}
