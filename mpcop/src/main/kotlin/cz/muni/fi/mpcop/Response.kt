package cz.muni.fi.mpcop


/**
 * The [Response] class represents a response object
 * that is sent to the front-end controller
 *
 * @author Kristian Mika
 */
// TODO: operation as an enum
data class Response(var operation: String) {
    var success: Boolean = true
    var errMessage: String? = null
    var message: String? = null
    private var signature: String? = null
    private var publicKey: String? = null

    constructor(operation: Operation) : this(operation.toString())

    fun failed(): Response {
        success = false
        return this
    }

    fun succeeded(): Response {
        success = true
        return this
    }

    fun setOperation(operation: String): Response {
        this.operation = operation
        return this
    }

    fun setOperation(operation: Enum<Operation>): Response {
        return setOperation(operation.toString())
    }

    fun setErrMessage(errMessage: String?): Response {
        this.errMessage = errMessage
        return this
    }

    fun setMessage(message: String): Response {
        this.message = message
        return this
    }

    fun setPublicKey(publicKey : String):Response {
        this.publicKey = publicKey
        return this
    }

    fun setSignatures(sigs: List<String>):Response {
        this.signature = sigs.joinToString(";")
        return this
    }
}
