package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.myst.MystVerticle
import cz.muni.fi.mpcop.smpcrsa.SmpcRsaVerticle
import io.vertx.core.AbstractVerticle
import io.vertx.core.AsyncResult
import io.vertx.core.DeploymentOptions
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
        deployWorkerVerticle(MystVerticle::class.java.name)
        deployWorkerVerticle(SmpcRsaVerticle::class.java.name)
        deployWorkerVerticle(PingVerticle::class.java.name)
        deployVerticle(ControllerVerticle::class.java.name)
    }

    /**
     * Deploys the [className] verticle specified in the argument and logs the result
     */
    private fun deployVerticle(className: String, deploymentOptions: DeploymentOptions? = DeploymentOptions()) {
        vertx.deployVerticle(className, deploymentOptions) { result: AsyncResult<String?> ->
            if (result.succeeded()) {
                logger.info("Successfully deployed $className.")
            } else {
                logger.severe("Couldn't deploy $className: ${result.cause()}")
                logger.severe(result.cause().stackTraceToString())
            }
        }
    }

    /**
     * Deploys the [className] verticle as a worker verticle
     */
    private fun deployWorkerVerticle(className: String) {
        deployVerticle(className, workerOptions)
    }

    override fun start() {
        logger.info("Deployer verticle has started.")
        deployVerticles()
    }

    companion object {
        private val logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME)
        private val workerOptions = DeploymentOptions()
            .setWorker(true)
            .setInstances(1)
            .setWorkerPoolSize(1)
    }
}
