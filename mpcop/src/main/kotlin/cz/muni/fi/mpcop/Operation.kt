package cz.muni.fi.mpcop

/**
 * The [Operation] enum contains all allowed requests for implemented protocols
 */
enum class Operation {
    INFO, KEYGEN, RESET, GET_PUBKEY, SIGN, ENCRYPT, DECRYPT, CONFIGURE, GET_CONFIG
}
