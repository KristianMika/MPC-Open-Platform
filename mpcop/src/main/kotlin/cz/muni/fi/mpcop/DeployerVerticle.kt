package cz.muni.fi.mpcop

import cz.muni.fi.mpcop.myst.MystVerticle
import cz.muni.fi.mpcop.ping.PingVerticle
import cz.muni.fi.mpcop.smpcrsa.SmpcRsaVerticle
import io.vertx.core.AbstractVerticle
import io.vertx.core.AsyncResult
import io.vertx.core.DeploymentOptions
import java.util.logging.Logger


/**
 * The [DeployerVerticle] class is responsible only for deploying other verticles.
 */
class DeployerVerticle : AbstractVerticle() {
    /**
     * A wrapper method that deploys all the verticles
     */
    private fun deployVerticles() {
        // we want to deploy the protocol verticles as worker verticles,
        // to avoid blocking the event loop, since they
        // perform long-lasting computations
        deployWorkerVerticle(MystVerticle::class.java.name)
        deployWorkerVerticle(SmpcRsaVerticle::class.java.name)
        deployWorkerVerticle(PingVerticle::class.java.name)
        deployVerticle(ControllerVerticle::class.java.name)
    }

    /**
     * Deploys the [className] verticle with specified [deploymentOptions]
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
        private const val workerInstances = 1
        private const val workerPoolSize = 1
        private val workerOptions = DeploymentOptions()
            .setWorker(true)
            .setInstances(workerInstances)
            .setWorkerPoolSize(workerPoolSize)
    }
}
