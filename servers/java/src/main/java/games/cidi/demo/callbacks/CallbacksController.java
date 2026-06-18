package games.cidi.demo.callbacks;

import games.cidi.demo.cidi.CidiSignature;
import games.cidi.demo.config.AppConfig;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/callbacks")
public class CallbacksController {
    private final AppConfig config;
    private final Set<String> paidGameOrderNos = ConcurrentHashMap.newKeySet();
    private final Set<String> tournamentReportIds = ConcurrentHashMap.newKeySet();

    public CallbacksController(AppConfig config) {
        this.config = config;
    }

    @PostMapping("/order-paid")
    public Map<String, Object> receiveOrderPaid(
            @RequestBody Map<String, Object> body,
            @RequestHeader(value = "X-Timestamp", required = false) String timestamp,
            @RequestHeader(value = "X-Nonce", required = false) String nonce,
            @RequestHeader(value = "X-Signature", required = false) String signature
    ) {
        if (config.getCidiCallbackSecret().isBlank()) {
            return callbackResponse(1002, "callback secret is not configured");
        }

        if (isBlank(timestamp) || isBlank(nonce) || isBlank(signature)) {
            return callbackResponse(1003, "missing callback signature headers");
        }

        boolean valid = CidiSignature.verifySignature(
                body,
                timestamp,
                nonce,
                signature,
                config.getCidiCallbackSecret()
        );
        if (!valid) {
            return callbackResponse(1004, "invalid callback signature");
        }

        String gameOrderNo = CidiSignature.stringifySignValue(body.get("gameOrderNo"));
        if (!paidGameOrderNos.add(gameOrderNo)) {
            return callbackResponse(0, "duplicate callback ignored");
        }

        return callbackResponse(0, "success");
    }

    @PostMapping("/tournament-score")
    public Map<String, Object> receiveTournamentScore(@RequestBody Map<String, Object> body) {
        String reportId = CidiSignature.stringifySignValue(body.get("reportId"));
        if (!tournamentReportIds.add(reportId)) {
            return callbackResponse(0, "duplicate callback ignored");
        }

        return callbackResponse(0, "success");
    }

    private Map<String, Object> callbackResponse(int code, String message) {
        return Map.of(
                "code", code,
                "message", message
        );
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
