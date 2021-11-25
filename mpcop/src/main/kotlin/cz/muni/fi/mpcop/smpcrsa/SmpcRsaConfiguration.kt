package cz.muni.fi.mpcop.smpcrsa


/**
 * The [SmpcRsaConfiguration] data class contains configuration attributes specific to Smart-ID RSA
 * These attributes are configurable from the front-end client
 */
data class SmpcRsaConfiguration(val isServerSimulated: Boolean, val isClientSimulated: Boolean) {
}