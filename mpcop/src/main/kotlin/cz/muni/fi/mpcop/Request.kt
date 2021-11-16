package cz.muni.fi.mpcop

data class Request(val protocol: String, val operation: Operation, val data: String)
