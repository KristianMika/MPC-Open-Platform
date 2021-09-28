package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.myst.MystVerticle
import cz.muni.fi.mpcop.smpcrsa.SmpcRsaVerticle
import io.vertx.core.AbstractVerticle
import io.vertx.core.AsyncResult
import java.util.logging.Logger


/**
 * The [DeployerVerticle] class is responsible only for deploying other verticles.
 *
 * @author Kristian Mika
 */
class DeployerVerticle : AbstractVerticle() {
    /**
     * A wrapper method that deploys all the verticles
     */
    private fun deployVerticles() {
        deployVerticle(MystVerticle::class.java.name)
        deployVerticle(SmpcRsaVerticle::class.java.name)
        deployVerticle(ControllerVerticle::class.java.name)
    }

    override fun start() {
        logger.info("Deployer verticle has started.")
        deployVerticles()
    }

    /**
     * Deploys the verticle specified in the argument and logs the result
     * @param className of the verticle to be deployed
     */
    private fun deployVerticle(className: String) {
        vertx.deployVerticle(className) { result: AsyncResult<String?> ->
            if (result.succeeded()) {
                logger.info("Successfully deployed $className.")
            } else {
                logger.severe("Couldn't deploy $className: ${result.cause()}")
                logger.severe(result.cause().stackTraceToString())
            }
        }
    }

    companion object {
        private val logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
    }
}
