package com.mpcopenplatform.controller;

import com.mpcopenplatform.controller.myst.MystVerticle;
import io.vertx.core.AbstractVerticle;
import io.vertx.core.http.HttpServer;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.bridge.PermittedOptions;
import io.vertx.ext.web.Router;
import io.vertx.ext.web.handler.TemplateHandler;
import io.vertx.ext.web.handler.sockjs.SockJSBridgeOptions;
import io.vertx.ext.web.handler.sockjs.SockJSHandler;
import io.vertx.ext.web.handler.sockjs.SockJSHandlerOptions;
import io.vertx.ext.web.templ.handlebars.HandlebarsTemplateEngine;

import java.net.SocketException;
import java.net.UnknownHostException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.logging.Logger;


/**
 * TODO: refactor
 * The {@link ControllerVerticle} carries communication between the UI controller and
 * the backend verticles.
 *
 * @author Kristian Mika
 */
public class ControllerVerticle extends AbstractVerticle {
    public static final String CONTROLLER_ADDRESS = "service.controller";
    public static final String CONTROLLER_REGISTER_ADDRESS = "service.controller-register";
    public static final String CONTROLLER_BRIDGE_PATH = "/mpcop-event-bus";
    public static final String ROOT_PATH = "/index.hbs";
    public static final String MYST_PATH = "/myst.hbs";
    public static final String SMART_ID_RSA_PATH = "/smart-id-rsa.hbs";
    private static final Logger logger = Logger.getLogger(Logger.GLOBAL_LOGGER_NAME);
    private static final int CONTROLLER_PORT = 8080;
    private static final String HANDLER_HBS_PATH = ".+\\.hbs";
    private static final String HANDLER_RESOURCES_PATH = "/resources/*";
    private static final int NOT_FOUND_ERROR_CODE = 404;
    private static final int HEART_BEAT_INTERVAL = 2000;
    static AtomicInteger connectionCounter = new AtomicInteger();
    TemplateHandler hbsTemplateHandler;

    @Override
    public void start() {
        hbsTemplateHandler = TemplateHandler.create(HandlebarsTemplateEngine.create(vertx));

        HttpServer server = vertx.createHttpServer();

        Router router = Router.router(vertx);

        setHandlers(router);

        SockJSHandlerOptions options = new SockJSHandlerOptions().setHeartbeatInterval(HEART_BEAT_INTERVAL);
        SockJSHandler sockJSHandler = SockJSHandler.create(vertx, options);
        SockJSBridgeOptions bo = new SockJSBridgeOptions()
                .addInboundPermitted(new PermittedOptions().setAddress(CONTROLLER_ADDRESS))
                .addInboundPermitted(new PermittedOptions().setAddress(CONTROLLER_REGISTER_ADDRESS))
                .addOutboundPermitted(new PermittedOptions().setAddress(CONTROLLER_REGISTER_ADDRESS));

        vertx.eventBus().consumer(CONTROLLER_ADDRESS, msg -> {
            vertx.eventBus()
                    .request("service." + getProtocol((JsonObject) msg.body()), msg.body())
                    .onSuccess(data -> {
                        logger.info("Received from " + MystVerticle.CONSUMER_ADDRESS + ": " + data.body().toString());
                        msg.reply(data.body().toString());
                    }).onFailure(thrwbl -> {
                logger.info(Messages.REPLY_FAIL_MESSAGE + thrwbl.toString());
                msg.reply(Messages.ERROR_MESSAGE);
            }).onComplete(msgComp -> {
                logger.info(Messages.REPLY_SUCCESS_MESSAGE);
            });
        });

        sockJSHandler.bridge(bo, event -> {

            switch (event.type()) {
                case REGISTER:
                    logNewConnection(event.socket().remoteAddress().toString());

                    break;
                case UNREGISTER:
                    logClosedConnection(event.socket().remoteAddress().toString());

                    break;
            }
            event.complete(true);
        });

        router.route(CONTROLLER_BRIDGE_PATH + "/*").handler(sockJSHandler);

        server.requestHandler(router).listen(CONTROLLER_PORT);
        logger.info("Controller has been successfully deployed and is now running on port " + CONTROLLER_PORT + ".");
        logger.info(getPrivateIpAnnouncement());

    }

    /**
     * Creates an announcement containing the host's private IP address and instructions on accessing
     * the control panel from other computers.
     */
    private String getPrivateIpAnnouncement() {
        String message = "You can access the control panel from computers within this LAN at ";
        try {
            String privateIp = Util.getPrivateIp();
            message += privateIp + ":" + CONTROLLER_PORT + ".";
        } catch (UnknownHostException | SocketException ignored) {
            message += "port " + CONTROLLER_PORT + " of this computer.";
        }
        return message;
    }

    private void logNewConnection(String address) {
        logger.info("New connection from " + address
                + "\nTotal number of connections: " + connectionCounter.incrementAndGet());
    }

    private void logClosedConnection(String address) {
        logger.info("Connection from " + address + " has been terminated."
                + "\nTotal number of connections: " + connectionCounter.decrementAndGet());
    }


    public static String getProtocol(JsonObject message) {
        return message.getString("protocol");
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
                    context.fail(NOT_FOUND_ERROR_CODE);
                }
            });
        });

        // Handler for templated hbs files
        router.getWithRegex(HANDLER_HBS_PATH).handler(hbsTemplateHandler);

        router.get("/").handler(ctx -> {
            ctx.reroute(ROOT_PATH);
        });

        router.get("/myst").handler(ctx -> {
            ctx.reroute(MYST_PATH);
        });

        router.get("/smart-id-rsa").handler(ctx -> {
            ctx.reroute(SMART_ID_RSA_PATH);
        });
    }
}
