package com.mpcopenplatform.controller;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.json.JsonObject;

import java.util.logging.Logger;

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

            String response;
            try {
                response = process((JsonObject) msg.body());
            } catch (GeneralMPCOPException e) {
                logger.warning(e.toString());
                response = Messages.ERROR_MESSAGE;
            }
            logger.info("Replying: " + response);
            msg.reply(response);
        });
    }

    /**
     * Processes a request and calls the correct method.
     *
     * @param request as a JsonObject to be processed
     * @return the result of the correct operation in plaintext
     * @throws GeneralMPCOPException if the requested operation is not valid
     */
    String process(JsonObject request) throws GeneralMPCOPException {

        String rawOperation = request.getString("operation");
        Operation operation;

        try {
            operation = Operation.valueOf(rawOperation);
        } catch (IllegalArgumentException e) {
            throw new GeneralMPCOPException("Invalid operation " + rawOperation);
        }

        switch (operation) {

            case INFO:
                return getInfo();

            case KEYGEN:
                return keygen();

            case RESET:
                return reset();

            case GET_PUBKEY:
                return getPubKey();

            case DECRYPT:
                return decrypt(request.getString("data"));

            case SIGN:
                return sign(request.getString("data"));

            default:
                throw new RuntimeException("Unreachable code");

        }
    }

    protected abstract String sign(String data);

    protected abstract String decrypt(String data);

    protected abstract String getPubKey();

    protected abstract String reset();

    /**
     * Generates keys
     * TODO: consider modifying the return type to void
     *
     * @return
     */
    protected abstract String keygen();

    /**
     * Returns information about the protocol run, e.g. a number of participants, current state, etc.
     *
     * @return information in plain text
     */
    protected abstract String getInfo();
}
