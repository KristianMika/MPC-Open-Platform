package com.mpcopenplatform.controller.myst;

import com.google.gson.Gson;

public class Util {

    public static <T> T fromJson(String json, Class<T> clazz) {
        return new Gson().fromJson(json, clazz);
    }

}
