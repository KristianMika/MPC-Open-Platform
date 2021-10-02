package cz.muni.fi.mpcop

import io.vertx.core.AbstractVerticle

import io.vertx.ext.web.Router
import io.vertx.ext.web.handler.StaticHandler

import java.util.logging.Logger

class StaticServerVerticle: AbstractVerticle() {


    override fun start() {
        val router = Router.router(vertx);
        val server = vertx.createHttpServer().requestHandler(router)
        router.route("/*").handler(StaticHandler.create(staticContentDir));
        server.listen(SERVER_PORT)
    }

    companion object {
        private val logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
        private val SERVER_PORT:Int = 8083
        private val staticContentDir: String = "./static"
    }
}