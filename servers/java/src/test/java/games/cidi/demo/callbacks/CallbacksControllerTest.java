package games.cidi.demo.callbacks;

import games.cidi.demo.cidi.CidiSignature;
import games.cidi.demo.config.AppConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CallbacksController.class)
@Import(AppConfig.class)
@TestPropertySource(properties = "CIDI_CALLBACK_SECRET=callback-secret")
class CallbacksControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Test
    void receiveOrderPaidVerifiesSignature() throws Exception {
        Map<String, Object> body = orderPaidBody();
        String timestamp = "1768393700";
        String nonce = "f47ac10b58cc4d";
        String signature = CidiSignature.generateSignature(body, timestamp, nonce, "callback-secret");

        mockMvc.perform(post("/callbacks/order-paid")
                        .contentType("application/json")
                        .header("X-Timestamp", timestamp)
                        .header("X-Nonce", nonce)
                        .header("X-Signature", signature)
                        .content("{\"event\":\"order.paid\",\"orderNo\":\"CIDI123\",\"gameOrderNo\":\"GAME123\",\"amount\":10,\"metadata\":\"demo\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.message").value("success"));
    }

    @Test
    void receiveOrderPaidRejectsInvalidSignature() throws Exception {
        mockMvc.perform(post("/callbacks/order-paid")
                        .contentType("application/json")
                        .header("X-Timestamp", "1768393700")
                        .header("X-Nonce", "f47ac10b58cc4d")
                        .header("X-Signature", "bad")
                        .content("{\"event\":\"order.paid\",\"orderNo\":\"CIDI123\",\"gameOrderNo\":\"GAME123\",\"amount\":10}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(1004))
                .andExpect(jsonPath("$.message").value("invalid callback signature"));
    }

    private Map<String, Object> orderPaidBody() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("event", "order.paid");
        body.put("orderNo", "CIDI123");
        body.put("gameOrderNo", "GAME123");
        body.put("amount", 10);
        body.put("metadata", "demo");
        return body;
    }
}
