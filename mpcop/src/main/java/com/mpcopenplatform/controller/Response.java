package com.mpcopenplatform.controller;

import java.security.InvalidParameterException;

/**
 * The {@link Response} class represents a response sent to the front-end controller
 * after it has been serialised as JSON
 *
 * @author Kristian Mika
 */
public class Response {

    private Boolean success = true;
    private String errMessage;
    private String message;
    private String sig1;
    private String sig2;
    private String publicKey;
    private String operation;


    public Response() {

    }

    public Response(Boolean success) {
        this.success = success;
    }


    public Response(String message) {
        this.message = message;
    }


    public void setSig1(String sig1) {
        this.sig1 = sig1;
    }

    public void setSignatures(String[] signatures) {
        if (signatures.length == 0) {
            throw new InvalidParameterException("Empty signature array");
        }
        sig1 = signatures[0];
        if (signatures.length == 2) {
            sig2 = signatures[1];
        }
    }

    public void failed() {
        success = false;
    }

    public void succeeded() {
        success = true;
    }

    public void setErrMessage(String errMessage) {
        this.errMessage = errMessage;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setPublicKey(String publicKey) {
        this.publicKey = publicKey;
    }

    public void setOperation(Enum<Operation> operation) {
        this.operation = operation.toString();
    }
}
