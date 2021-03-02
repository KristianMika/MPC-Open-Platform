package com.mpcopenplatform.controller;

import com.mpcopenplatform.controller.myst.MystVerticle;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.Launcher;

import java.util.logging.Logger;


/**
 * The {@link DeployerVerticle} class is responsible only for deploying other verticles
 *
 * @author Kristian Mika
 */
public class DeployerVerticle extends AbstractVerticle {
    private static final Logger logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);

    public static void main(String[] args) {
        Launcher.main(new String[]{"run", DeployerVerticle.class.getName()});
    }

    protected void deployVerticles() {
        deployVerticle(MystVerticle.class.getName());
        deployVerticle(ControllerVerticle.class.getName());
    }

    @Override
    public void start() {
        logger.info("Deployer verticle has started.");
        deployVerticles();
    }

    protected void deployVerticle(String className) {
        vertx.deployVerticle(className, result -> {
            if (result.succeeded()) {
                logger.info("Successfully deployed " + className + ".");
            } else {
                logger.severe("Couldn't deploy " + className + ". Cause: " + result.cause());
            }
        });

    }
}
