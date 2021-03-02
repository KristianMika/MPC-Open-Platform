package com.mpcopenplatform.controller;

import com.mpcopenplatform.controller.myst.MystVerticle;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServer;
import io.vertx.ext.bridge.PermittedOptions;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.TemplateHandler;
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;
import io.vertx.ext.web.templ.handlebars.HandlebarsTemplateEngine;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;

/**
 * The {@link ControllerVerticle} carries communication between the UI controller and
 * the backend verticles.
 *
 * @author Kristian Mika
 */
public class ControllerVerticle extends AbstractVerticle {
    public static final String CONTROLLER_ADDRESS = "service.controller";
    public static final String SMARD_ID_RSA_CONTROLLER_ADDRESS = "service.controller.smart-id-rsa";
    public static final String MYST_CONTROLLER_ADDRESS = "service.controller.myst";
    public static final String CONTROLLER_REGISTER_ADDRESS = "service.controller-register";
    public static final String CONTROLLER_BRIDGE_PATH = "/mpcop-event-bus";
    private static final Logger logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);
    private static final int CONTROLLER_PORT = 8080;
    private static final String HANDLER_HBS_PATH = ".+\\.hbs";
    private static final String HANDLER_RESOURCES_PATH = "/resources/*";

    // Consts
    static AtomicInteger connectionCounter = new AtomicInteger();
    TemplateHandler hbsTemplateHandler;

    @Override
    public void start() {
        hbsTemplateHandler = TemplateHandler.create(HandlebarsTemplateEngine.create(vertx));

        HttpServer server = vertx.createHttpServer();

        Router router = Router.router(vertx);

        setHandlers(router);

        SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(2000);
        SockJSHandler sockJSHandler = SockJSHandler.create(vertx, options);
        SockJSBridgeOptions bo = new SockJSBridgeOptions()
                .addInboundPermitted(new PermittedOptions().setAddress(CONTROLLER_ADDRESS))
                // TODO: only one address should be permitted
                .addInboundPermitted(new PermittedOptions().setAddress(SMARD_ID_RSA_CONTROLLER_ADDRESS))
                .addInboundPermitted(new PermittedOptions().setAddress(MYST_CONTROLLER_ADDRESS))
                .addInboundPermitted(new PermittedOptions().setAddress(CONTROLLER_REGISTER_ADDRESS))
                .addOutboundPermitted(new PermittedOptions().setAddress(CONTROLLER_REGISTER_ADDRESS));


        vertx.eventBus().consumer(MYST_CONTROLLER_ADDRESS, msg -> {
            vertx.eventBus()
                    .request(MystVerticle.CONSUMER_ADDRESS, msg.body())
                    .onSuccess(data -> {
                        logger.info("Received from " + MystVerticle.CONSUMER_ADDRESS + ": " + data.body().toString());

                        msg.reply(data.body().toString());
                    }).onFailure(thrwbl -> {
                logger.info("Failed to reply: " + thrwbl.toString());
                msg.reply("An error occurred");
            }).onComplete(msgComp -> {
                logger.info("Successfully replied");
            });
        });


        sockJSHandler.bridge(bo, event -> {

            switch (event.type()) {
                case REGISTER:
                    logger.info("New connection from " + event.socket().remoteAddress().toString()
                            + "\nTotal number of connections: " + connectionCounter.incrementAndGet());
                    break;
                case UNREGISTER:
                    logger.info("Connection from " + event.socket().remoteAddress().toString() + " has been terminated."
                            + "\nTotal number of connections: " + connectionCounter.decrementAndGet());
                    break;
            }
            event.complete(true);
        });

        router.route(CONTROLLER_BRIDGE_PATH + "/*").handler(sockJSHandler);

        server.requestHandler(router).listen(CONTROLLER_PORT);
        logger.info("Controller has been successfully deployed and is now running on port " + CONTROLLER_PORT + ".");
    }


    void setHandlers(Router router) {
        // A handler for serving css and js resources
        router.get(HANDLER_RESOURCES_PATH).handler(context -> {
            String filename = context.request().path().substring(1);
            vertx.fileSystem().exists(filename, b -> {
                if (b.result()) {
                    context.response().sendFile(filename);
                } else {
                    logger.info("An attempt was made to access '" + context.request().path() + "'.");
                    context.fail(404);
                }
            });
        });

        // Handler for templated hbs files
        router.getWithRegex(HANDLER_HBS_PATH).handler(hbsTemplateHandler);

        router.get("/").handler(ctx -> {
            ctx.reroute("/index.hbs");
        });

        router.get("/myst").handler(ctx -> {
            ctx.reroute("/myst.hbs");
        });

        router.get("/smart-id-rsa").handler(ctx -> {
            ctx.reroute("/smart-id-rsa.hbs");
        });
    }
}
