package cz.muni.fi.mpcop.ping

import cz.muni.fi.mpcop.BaseResponse

/**
 * The [PingResponse] represents a response from the server to a [PingRequest] request
 */
data class PingResponse(val operation: PingOperation?) : BaseResponse() {

    constructor () : this(null)

    fun setMessage(message: String): PingResponse {
        this.message = message
        return this
    }

    fun setErrMessage(message: String): PingResponse {
        this.errMessage = message
        return this
    }

    fun setData(data: String): PingResponse {
        this.data = data
        return this
    }

    fun failed(): PingResponse {
        this.success = false
        return this
    }
}
