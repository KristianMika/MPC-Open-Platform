package com.mpcopenplatform.controller;

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


}
