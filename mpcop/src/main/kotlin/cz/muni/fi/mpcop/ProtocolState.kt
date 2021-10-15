package cz.muni.fi.mpcop

/**
 * The [ProtocolState] class holds the current protocol state and provides cache storage for public key querying
 */
class ProtocolState {
    var pubKey: String? = null
    var exception: Exception? = null
}