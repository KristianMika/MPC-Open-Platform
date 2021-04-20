package com.mpcopenplatform.controller.myst;

import com.mpcopenplatform.controller.Operation;
import com.mpcopenplatform.controller.Response;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.EventBus;
import io.vertx.core.json.JsonObject;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Myst verticle test")
@ExtendWith(VertxExtension.class)
class MystVerticleTest {


    @BeforeEach
    @DisplayName("Deploy a verticle")
    void before(Vertx vertx, VertxTestContext testContext){
        vertx.deployVerticle(new MystVerticle(), testContext.succeedingThenComplete());
    }

    @AfterEach
    void after(Vertx vertx, VertxTestContext testContext) {
        vertx.close(testContext.succeedingThenComplete());
    }

    @Test
    @DisplayName("Can return info")
    public void canReturnInfo(Vertx vertx, VertxTestContext testContext) {

        EventBus eventBus = vertx.eventBus();
        // TODO: create a request class in tests
        JsonObject request = new JsonObject();
        request.put("operation", Operation.INFO.toString());
        request.put("data", "");

        eventBus.request(MystVerticle.CONSUMER_ADDRESS, request, x -> {
            Response r = Util.fromJson(x.result().body().toString(), Response.class);

            assertTrue(r.getSuccess(), "Response is not successful");
            assertNotNull(r.getMessage(), "Empty response message");
            assertNull(r.getErrMessage(), "Not empty error message");
            assertEquals(Operation.INFO.toString(), r.getOperation(), "Incorrect operation");

            testContext.completeNow();
        });
    }
}
