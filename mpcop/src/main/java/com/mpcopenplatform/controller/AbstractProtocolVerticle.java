package com.mpcopenplatform.controller;

import io.vertx.core.AbstractVerticle;
import io.vertx.core.json.JsonObject;

import java.util.logging.Logger;

import static com.mpcopenplatform.controller.Util.toJson;

/**
 * The {@link AbstractProtocolVerticle} class represents
 * a base class for all protocols included in the MPC OP.
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
                response = new Response().failed().setErrMessage(e.getMessage());
            }
            String serializedResponse = toJson(response);
            logger.info("Replying: " + serializedResponse);
            msg.reply(serializedResponse);
        });
    }

    /**
     * Processes a request and calls the correct method.
     *
     * @param request to be processed
     * @return the result of the requested operation
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

        Response r = new Response().setOperation(operation);

        switch (operation) {

            case INFO:
                return new Response(getInfo());

            case KEYGEN:
                keygen();
                return r.setPublicKey(getPubKey());

            case RESET:
                return r.setMessage(Messages.CARDS_RESET_SUCCESSFUL);

            case GET_PUBKEY:
                return r.setPublicKey(getPubKey());

            case DECRYPT:
                String data = request.getString("data");
                return new Response(decrypt(data));

            case SIGN:
                return r.setSignatures(sign(request.getString("data")));

            default:
                throw new RuntimeException("Unreachable code");
        }
    }

    /**
     * Serves the sign request - signs the input data string
     *
     * @param data to be signed
     * @return all parts of the signature in a string array
     * @throws GeneralMPCOPException if signing fails
     */
    protected abstract String[] sign(String data) throws GeneralMPCOPException;

    /**
     * Servers the decrypt request - decrypts the encrypted data
     *
     * @param data to be decrypted
     * @return the plaintext
     * @throws GeneralMPCOPException if decryption fails
     */
    protected abstract String decrypt(String data) throws GeneralMPCOPException;

    /**
     * Servers the "get public key" request - returns the public key
     *
     * @return the public key of the protocol
     * @throws GeneralMPCOPException if fails
     */
    protected abstract String getPubKey() throws GeneralMPCOPException;

    /**
     * Serves the reset request - reset the protocol and invalidates all cryptographic secrets
     *
     * @throws GeneralMPCOPException if resetting fails
     */
    protected abstract void reset() throws GeneralMPCOPException;

    /**
     * Serves the "generate keys" request - generates keys.
     *
     * @throws GeneralMPCOPException if generation fails
     */
    protected abstract void keygen() throws GeneralMPCOPException;

    /**
     * Serves the "get info" request - Returns information about the protocol run,
     * e.g. the number of participants, the current protocol state, etc.
     *
     * @return protocol information
     */
    protected abstract String getInfo();
}
