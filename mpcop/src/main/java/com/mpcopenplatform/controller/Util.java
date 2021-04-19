package com.mpcopenplatform.controller;

import com.google.gson.GsonBuilder;

import java.math.BigInteger;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;


/**
 * The {@link Util} class holds utility methods used in other classes
 *
 * @author Kristian Mika
 */
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


    /**
     * Serializes the input object to JSON
     *
     * @param src object to be serialized
     * @return the result JSON object as a string
     */
    public static String toJson(Object src) {
        return new GsonBuilder().create().toJson(src);
    }

    /**
     * Returns the private IP address of the preferred interface.
     *
     * @return ip address
     * @throws SocketException      if a socket can't be open
     * @throws UnknownHostException if the IP address can't be determined
     */
    public static String getPrivateIp() throws SocketException, UnknownHostException {
        final String targetAddress = "8.8.8.8";
        final int destinationPort = 10002;
        try (final DatagramSocket socket = new DatagramSocket()) {
            socket.connect(InetAddress.getByName(targetAddress), destinationPort);
            return socket.getLocalAddress().getHostAddress();
        }
    }
}
