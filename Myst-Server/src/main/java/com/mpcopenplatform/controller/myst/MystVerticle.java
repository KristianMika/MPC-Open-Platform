package com.mpcopenplatform.controller.myst;

import com.mpcopenplatform.controller.ControllerVerticle;
import com.mpcopenplatform.controller.Util;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.json.JsonObject;
import mpctestclient.MPCRun;
import mpctestclient.MPCRunConfig;
import org.bouncycastle.util.encoders.Hex;

import java.util.Locale;
import java.util.logging.Logger;


/**
 * The {@link MystVerticle} receives requests from the {@link ControllerVerticle},
 * executes them and returns the result.
 *
 * @author Kristian Mika
 */
public class MystVerticle extends AbstractVerticle {
    private static final Logger logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);
    private MPCRun run;
    public static final String CONSUMER_ADDRESS = "service.myst";


    public MystVerticle() {
        try {
            this.run = new MPCRun(MPCRunConfig.getDefaultConfig());
            run.connectAll();

            // TODO: the operator will setup cards
            run.performSetupAll(run.hostFullPriv);

        } catch (Exception e) {
            logger.severe("Can not instantiate MPC run");
        }
    }

    @Override
    public void start() {
        vertx.eventBus().consumer(CONSUMER_ADDRESS, msg -> {
            logger.info("Received: " + msg.toString());
            String response = process((JsonObject) msg.body());
            msg.reply(response);
            logger.info("Replying: " + response);
        });
    }

    private String process(JsonObject request) {

        switch (request.getString("operation")) {

            case "Info":
                return getInfo();

            case "Keygen":
                return keygen();

            case "Reset":
                return reset();

            case "GetYagg":
                return getYagg();

            case "Decrypt":
                return decrypt(request.getString("data"));

            case "Sign":
                return sign(request.getString("data"));


            default:
                return "Unknown operation";
        }
    }

    private String getInfo() {
        StringBuilder response = new StringBuilder();
        response.append("Number of players: ").append(run.runCfg.numPlayers).append("\n");
        response.append("Number of hosts: ").append(run.hosts.size()).append("\n");
        response.append("Yagg: ").append(getYagg()).append("\n");

        return response.toString();
    }

    private String keygen() {
        try {
            run.performKeyGen(run.hostKeyGen);

            // TODO: only once
            run.signCacheAll(run.hostDecryptSign);


        } catch (Exception e) {
            e.printStackTrace();
            // TODO
            return "An error occured";
        }

        return getYagg();
    }

    private String reset() {
        try {
            run.resetAll(run.hostFullPriv);
            return "OK";
        } catch (Exception e) {
            e.printStackTrace();
            return "An error occured";
        }
    }


    private String getYagg() {
        try {
            return Hex.toHexString(run.getYagg().getEncoded(false)).toUpperCase(Locale.ROOT);
        } catch (Exception e) {
            e.printStackTrace();
            // TODO
            return "Not known yet";
        }
    }

    private String sign(String data) {
        try {

            return run.signAll(Util.BigIntegerFromString(data), run.hostDecryptSign).toString(16);
        } catch (Exception e) {
            logger.info(e.toString());
            return "Error occured";
        }
    }

    private String decrypt(String data) {
        return "Not implemented yet";
    }
}
