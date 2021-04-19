package com.mpcopenplatform.controller;

/**
 * The {@link GeneralMPCOPException} is used for error handling inside the MPCOP
 */
public class GeneralMPCOPException extends Exception {
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

