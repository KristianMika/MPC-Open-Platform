package cz.muni.fi.mpcop

/**
 * The [GeneralMPCOPException] is used for error handling inside MPCOP
 */
class GeneralMPCOPException: Exception {
    constructor() : super()
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
    constructor(cause: Throwable) : super(cause)
}
