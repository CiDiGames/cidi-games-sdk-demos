package games.cidi.demo.demo;

import games.cidi.demo.cidi.CidiOpenApiClient;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class DemoService {
    private final CidiOpenApiClient cidi;

    public DemoService(CidiOpenApiClient cidi) {
        this.cidi = cidi;
    }

    public Map<String, Object> health() {
        return Map.of(
                "ok", true,
                "service", "cidi-java-demo",
                "timestamp", Instant.now().getEpochSecond()
        );
    }

    public Object verifyTempToken(Object tempToken) {
        return cidi.verifyTempToken(readRequiredString(tempToken, "tempToken"));
    }

    public Object queryBalance(String gameToken) {
        return cidi.queryBalance(readRequiredString(gameToken, "gameToken"));
    }

    public Object createOrder(Map<String, Object> body) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("gameOrderNo", readOptionalString(body.get("gameOrderNo"), createGameOrderNo()));
        payload.put("gameToken", readRequiredString(body.get("gameToken"), "gameToken"));
        payload.put("amount", readRequiredNumber(body.get("amount"), "amount"));
        copyOptionalString(payload, body, "description", "description");
        copyOptionalString(payload, body, "metadata", "metadata");
        copyOptionalString(payload, body, "callback_url", "callback_url");
        if (!payload.containsKey("callback_url")) {
            copyOptionalString(payload, body, "callbackUrl", "callback_url");
        }
        return cidi.createOrder(payload);
    }

    public Object queryOrder(String orderNo) {
        return cidi.queryOrder(readRequiredString(orderNo, "orderNo"));
    }

    public Object queryOrderByGameOrderNo(String gameOrderNo) {
        return cidi.queryOrderByGameOrderNo(readRequiredString(gameOrderNo, "gameOrderNo"));
    }

    public Object queryOrderRecords(Map<String, String> query) {
        return cidi.queryOrderRecords(new LinkedHashMap<>(query));
    }

    public Object reportMedal(Map<String, Object> body) {
        return cidi.reportMedal(body);
    }

    public Object queryMedalOwnership(Map<String, String> query) {
        return cidi.queryMedalOwnership(new LinkedHashMap<>(query));
    }

    public Object reportTournamentScore(Map<String, Object> body) {
        return cidi.reportTournamentScore(body);
    }

    public Object reportGameTask(Map<String, Object> body) {
        return cidi.reportGameTask(body);
    }

    public Object queryGameTaskResult(Map<String, String> query) {
        return cidi.queryGameTaskResult(new LinkedHashMap<>(query));
    }

    public Object queryReport(String reportId) {
        return cidi.queryReport(readRequiredString(reportId, "reportId"));
    }

    private String createGameOrderNo() {
        return "GAME" + System.currentTimeMillis() + UUID.randomUUID().toString().replace("-", "").substring(0, 8);
    }

    private void copyOptionalString(Map<String, Object> target, Map<String, Object> source, String sourceKey, String targetKey) {
        Object value = source.get(sourceKey);
        if (value instanceof String text && !text.isBlank()) {
            target.put(targetKey, text);
        }
    }

    private String readRequiredString(Object value, String field) {
        if (!(value instanceof String text) || text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " is required");
        }
        return text;
    }

    private String readOptionalString(Object value, String fallback) {
        if (value instanceof String text && !text.isBlank()) {
            return text;
        }
        return fallback;
    }

    private Number readRequiredNumber(Object value, String field) {
        if (value instanceof Number number) {
            return number;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " must be a number");
    }
}
