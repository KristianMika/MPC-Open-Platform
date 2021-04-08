package com.mpcopenplatform.controller;

import io.vertx.core.json.JsonObject;

import java.math.BigInteger;


public class Util {

    /**
     * Creates a positive BigInteger from a string
     *
     * @param input string
     * @return a positive BigInteger created from the input string
     */
    public static BigInteger BigIntegerFromString(String input) {
        return new BigInteger(1, input.getBytes());
    }

    public static String getProtocol(JsonObject message) {
        return message.getString("protocol");
    }
}