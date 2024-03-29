package cz.muni.fi.mpcop

/**
* The [Messages] object contains a list of messages that may be returned to the browser client
 */
object Messages {
    const val GENERIC_ERROR_MESSAGE = "Something went wrong."
    const val INVALID_FORMAT = "Invalid format"
    const val CARDS_RESET_SUCCESSFUL = "Cards have been successfully reset"
    const val NO_HANDLERS_ERROR = "The protocol is not running. Please, make sure you have connected" +
            " smart cards with the correct applets installed"
    const val TIMEOUT_ERROR = "The request has timed out - the operation took too long." +
            " You will be notified once the operation has been finished."
    const val INVALID_REQUEST_FORMAT_ERROR = "Invalid request format"
    const val UNCONFIGURED_PROTOCOL_ERROR = "The protocol has not been configured yet."
    const val MISSING_DATA_ERROR = "Requested operation requires data"
    const val KEYS_NOT_GENERATED_YET = "Public key has not been computed yet. Proceed with key generation"
    const val ZERO_PLAYERS_WARNING = "The protocol can't run with 0 players! Make sure you have connected cards."
    const val DECRYPTION_FAILED =  "Decryption failed"
    const val ENCRYPTION_FAILED = "Encryption failed"
    const val CONFIG_HAS_FAILED = "Configuration has failed"
    const val INSUFFICIENT_PRIVILEGES_ERROR = "You don't have sufficient privileges for this operation."
    const val APPLET_LOCKED_ERROR = "The applet has been locked. You need to reinstall the applet"
    const val INVALID_TRANSITION_ERROR = "The requested operation can't be executed in the current protocol state."
    const val TWO_APPLETS_IN_A_SIMULATOR_ERROR = "Can't run 2 applets in a simulator"
    const val OPERATION_NOT_SUPPORTED = "This operation is not supported"
}