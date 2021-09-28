package cz.muni.fi.mpcop

import com.google.gson.Gson


object Util {
    fun <T> fromJson(json: String?, clazz: Class<T>?): T {
        return Gson().fromJson(json, clazz)
    }
}
