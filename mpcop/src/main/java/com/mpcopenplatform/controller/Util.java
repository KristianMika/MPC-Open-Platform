package com.mpcopenplatform.controller;

import com.google.gson.GsonBuilder;
import io.vertx.core.json.JsonObject;

import java.math.BigInteger;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.net.SocketException;
import java.net.UnknownHostException;


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

    public static String toJson(Object src) {
        return new GsonBuilder().create().toJson(src);
    }

    /**
     * Returns the private IP address of the preferred interface.
     * @return ip address
     * @throws SocketException if a socket can't be open
     * @throws UnknownHostException if the IP address can't be determined
     */
    public static String getPrivateIp() throws SocketException, UnknownHostException {
        try (final DatagramSocket socket = new DatagramSocket()) {
            socket.connect(InetAddress.getByName("8.8.8.8"), 10002);
            return socket.getLocalAddress().getHostAddress();
        }
    }
}
