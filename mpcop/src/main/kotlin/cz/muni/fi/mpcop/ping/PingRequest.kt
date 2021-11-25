package cz.muni.fi.mpcop.ping

/**
 * The [PingRequest] represents a special case of a request - a performance testing request
 */
data class PingRequest(val operation: PingOperation)
