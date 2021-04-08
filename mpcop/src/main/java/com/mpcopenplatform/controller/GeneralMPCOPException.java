package com.mpcopenplatform.controller;

public class GeneralMPCOPException extends Exception{
    public GeneralMPCOPException(String message) {
        super(message);
    }

    public GeneralMPCOPException(String message, Throwable cause) {
        super(message, cause);
    }

    public GeneralMPCOPException(Throwable cause) {
        super(cause);
    }
}

