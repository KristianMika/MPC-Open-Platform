package cz.muni.fi.mpcop

/**
 * The [Request] class represents a request from the browser
 */
data class Request(val protocol: String, val operation: Operation, val data: String)
