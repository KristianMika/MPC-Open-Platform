package com.mpcopenplatform.controller;


/**
 * TODO: Consider loading a yml/xml/json/.../ file of messages
 */
public class Messages {

    public static final String ERROR_MESSAGE = "Something went wrong.";
    public static final String REPLY_SUCCESS_MESSAGE = "Successfully replied.";
    public static final String REPLY_FAIL_MESSAGE = "Failed to reply: ";
    public static final String NOT_SUPPORTED_MESSAGE = "The requested operation is not supported in this protocol.";
    public static final String CARDS_RESET_SUCCESSFUL = "Cards have been successfully reset";
    public static final String PROTOCOL_FAILURE = "Instantiation of the protocol has failed.";
    public static final String GENERIC_ERROR_MESSAGE = "An error occurred";
    public static final String NO_HANDLERS_ERROR = "The protocol is not running. Please, make sure you have connected" +
            " smart cards with the correct applets installed";
    public static final String TIMEOUT_ERROR = "The request has timed out - the operation took too long." +
            " In case you requested key generation, try request the public key.";
}
