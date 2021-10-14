package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.Utils.getPrivateIp
import io.vertx.core.AbstractVerticle
import io.vertx.ext.web.Router
import io.vertx.ext.web.handler.StaticHandler
import java.net.SocketException
import java.util.logging.Logger

class StaticServerVerticle : AbstractVerticle() {


    override fun start() {
        val router = Router.router(vertx)
        val server = vertx.createHttpServer().requestHandler(router)
        router.route("/*").handler(StaticHandler.create(staticContentDir))
        server.listen(SERVER_PORT)
        logger.info(getPrivateIpAnnouncement())
    }

    companion object {
        private val logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
        private const val SERVER_PORT: Int = 8083
        private const val staticContentDir: String = "./static"
    }

    /**
     * Creates an announcement containing the host's private IP address and instructions on accessing
     * the control panel from other computers.
     */
    private fun getPrivateIpAnnouncement(): String {
        var message = "You can access the control panel from computers within this LAN at "
        message += try {
            val privateIp: String = getPrivateIp()
            "$privateIp:$SERVER_PORT."
        } catch (ignored: SocketException) {
            "port $SERVER_PORT of this computer."
        }
        return message
    }
}