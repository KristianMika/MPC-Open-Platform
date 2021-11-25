package cz.muni.fi.mpcop


/**
 * The [Response] class represents a response object
 * that is sent to the front-end controller
 */
data class Response(var operation: Operation?) : BaseResponse() {
    private var signature: String? = null
    private var publicKey: String? = null

    constructor () : this(null)

    fun failed(): Response {
        success = false
        return this
    }

    fun succeeded(): Response {
        success = true
        return this
    }

    fun setData(data: String): Response {
        this.data = data
        return this
    }

    fun setOperation(operation: Operation): Response {
        this.operation = operation
        return this
    }

    fun setErrMessage(errMessage: String?): Response {
        this.errMessage = errMessage
        return this
    }

    fun setMessage(message: String): Response {
        this.message = message
        return this
    }

    fun setPublicKey(publicKey: String): Response {
        this.publicKey = publicKey
        return this
    }

    fun setSignatures(sigs: List<String>): Response {
        this.signature = sigs.joinToString(";")
        return this
    }
}
