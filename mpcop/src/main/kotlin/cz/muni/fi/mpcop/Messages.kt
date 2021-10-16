package cz.muni.fi.mpcop

/**
 * TODO: Consider loading a yml/xml/json/.../ file of messages
 */
object Messages {
    const val ERROR_MESSAGE = "Something went wrong."
    const val REPLY_SUCCESS_MESSAGE = "Successfully replied."
    const val REPLY_FAIL_MESSAGE = "Failed to reply: "
    const val NOT_SUPPORTED_MESSAGE = "The requested operation is not supported in this protocol."
    const val CARDS_RESET_SUCCESSFUL = "Cards have been successfully reset"
    const val PROTOCOL_FAILURE = "Instantiation of the protocol has failed."
    const val GENERIC_ERROR_MESSAGE = "An error occurred"
    const val NO_HANDLERS_ERROR = "The protocol is not running. Please, make sure you have connected" +
            " smart cards with the correct applets installed"
    const val TIMEOUT_ERROR = "The request has timed out - the operation took too long." +
            " In case you requested key generation, try refreshing the website."
}