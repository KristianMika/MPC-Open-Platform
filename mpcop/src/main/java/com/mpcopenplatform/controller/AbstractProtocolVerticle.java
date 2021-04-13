package com.mpcopenplatform.controller;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.json.JsonObject;

import java.util.Arrays;
import java.util.logging.Logger;

import static com.mpcopenplatform.controller.Util.toJson;

/**
 * The {@link AbstractProtocolVerticle} class represents
 * a base class for all crypto schemas included in the MPC OP.
 *
 * @author Kristian Mika
 */
public abstract class AbstractProtocolVerticle extends AbstractVerticle {
    public final String CONSUMER_ADDRESS;
    protected final Logger logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    public AbstractProtocolVerticle(String consumerAddress) {
        CONSUMER_ADDRESS = consumerAddress;
    }

    @Override
    public void start() {
        vertx.eventBus().consumer(CONSUMER_ADDRESS, msg -> {
            logger.info("Received: " + msg.body().toString());

            Response response;
            try {
                response = process((JsonObject) msg.body());
            } catch (GeneralMPCOPException e) {
                logger.warning(e.toString());
                response = new Response();
                response.failed();
                response.setErrMessage(e.getMessage());
            }

            logger.info("Replying: " + toJson(response));
            msg.reply(toJson(response));
        });
    }

    /**
     * Processes a request and calls the correct method.
     *
     * @param request as a JsonObject to be processed
     * @return the result of the correct operation in plaintext
     * @throws GeneralMPCOPException if the requested operation is not valid
     */
    Response process(JsonObject request) throws GeneralMPCOPException {

        String rawOperation = request.getString("operation");
        Operation operation;

        try {
            operation = Operation.valueOf(rawOperation);
        } catch (IllegalArgumentException e) {
            throw new GeneralMPCOPException("Invalid operation " + rawOperation);
        }

        Response r = new Response();
        r.setOperation(operation);

        switch (operation) {

            case INFO:
                return new Response(getInfo());

            case KEYGEN:
                keygen();
                r.setPublicKey(getPubKey());
                return r;

            case RESET:
                r.setMessage("Cards have been successfully reset");
                return r;

            case GET_PUBKEY:
                r.setPublicKey(getPubKey());
                return r;

            case DECRYPT:
                return new Response(decrypt(request.getString("data")));

            case SIGN:
                r.setOperation(Operation.SIGN);
                r.setSignatures(sign(request.getString("data")));
                return r;


            default:
                throw new RuntimeException("Unreachable code");

        }
    }

    protected abstract String[] sign(String data) throws GeneralMPCOPException;

    protected abstract String decrypt(String data);

    protected abstract String getPubKey() throws GeneralMPCOPException;

    protected abstract void reset() throws GeneralMPCOPException;

    /**
     * Generates keys
     *
     * @return
     */
    protected abstract void keygen() throws GeneralMPCOPException;

    /**
     * Returns information about the protocol run, e.g. a number of participants, current state, etc.
     *
     * @return information in plain text
     */
    protected abstract String getInfo();
}
