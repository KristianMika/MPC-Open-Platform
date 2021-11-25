package cz.muni.fi.mpcop

/**
 * The [BaseResponse] class contains some basic attributes that are used in all types of response classes
 */
open class BaseResponse {
    var success: Boolean = true
    var errMessage: String? = null
    var message: String? = null
    var data: String? = null
}
