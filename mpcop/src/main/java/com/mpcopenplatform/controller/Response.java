package com.mpcopenplatform.controller;

import java.security.InvalidParameterException;

/**
 * The {@link Response} class represents a response object
 * that is sent to the front-end controller
 *
 * @author Kristian Mika
 */
public class Response {

    private Boolean success = true;
    private String operation;
    private String errMessage;
    private String message;
    private String sig1;
    private String sig2;
    private String publicKey;


    public Response() {
    }

    public Response(Boolean success) {
        this.success = success;
    }

    public Response(String message) {
        this.message = message;
    }

    public Response failed() {
        success = false;
        return this;
    }

    public Response succeeded() {
        success = true;
        return this;
    }

    public Response setOperation(String operation) {
        this.operation = operation;
        return this;
    }

    public Response setOperation(Enum<Operation> operation) {
        this.operation = operation.toString();
        return this;
    }

    public Response setErrMessage(String errMessage) {
        this.errMessage = errMessage;
        return this;
    }

    public Response setMessage(String message) {
        this.message = message;
        return this;
    }

    public Response setSig1(String sig1) {
        this.sig1 = sig1;
        return this;
    }

    public Response setSig2(String sig2) {
        this.sig2 = sig2;
        return this;
    }

    public Response setPublicKey(String publicKey) {
        this.publicKey = publicKey;
        return this;
    }

    public Boolean getSuccess() {
        return success;
    }

    public String getOperation() {
        return operation;
    }

    public String getErrMessage() {
        return errMessage;
    }

    public String getMessage() {
        return message;
    }

    public String getSig1() {
        return sig1;
    }

    public String getSig2() {
        return sig2;
    }

    public String getPublicKey() {
        return publicKey;
    }

    /**
     * Sets signatures from the input array. The maximum number of signatures is 2.
     *
     * @param signatures array to be stored
     */
    public Response setSignatures(String[] signatures) {
        if (signatures.length == 0) {
            throw new InvalidParameterException("Empty signature array");
        }
        sig1 = signatures[0];
        if (signatures.length == 2) {
            sig2 = signatures[1];
        }
        return this;
    }
}
