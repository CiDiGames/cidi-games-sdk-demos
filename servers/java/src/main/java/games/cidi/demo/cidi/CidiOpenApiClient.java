package games.cidi.demo.cidi;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import games.cidi.demo.config.AppConfig;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.StringJoiner;

@Component
public class CidiOpenApiClient {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final AppConfig config;
    private final HttpClient httpClient;

    public CidiOpenApiClient(AppConfig config) {
        this.config = config;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    public Object verifyTempToken(String tempToken) {
        return request("GET", "/openapi/user/verify", Map.of("tempToken", tempToken), Map.of());
    }

    public Object queryBalance(String gameToken) {
        return request("GET", "/openapi/coin/balance", Map.of("gameToken", gameToken), Map.of());
    }

    public Object createOrder(Map<String, ?> payload) {
        return request("POST", "/openapi/order/create", Map.of(), payload);
    }

    public Object queryOrder(String orderNo) {
        return request("GET", "/openapi/order/" + urlEncode(orderNo), Map.of(), Map.of());
    }

    public Object queryOrderByGameOrderNo(String gameOrderNo) {
        return request("GET", "/openapi/order/by-game-order", Map.of("gameOrderNo", gameOrderNo), Map.of());
    }

    public Object queryOrderRecords(Map<String, ?> query) {
        return request("GET", "/openapi/order/records", query, Map.of());
    }

    public Object reportMedal(Map<String, ?> payload) {
        return request("POST", "/openapi/game/medal/report", Map.of(), payload);
    }

    public Object queryMedalOwnership(Map<String, ?> query) {
        return request("GET", "/openapi/game/medal/ownership", query, Map.of());
    }

    public Object reportTournamentScore(Map<String, ?> payload) {
        return request("POST", "/openapi/tournament/score", Map.of(), payload);
    }

    public Object reportGameTask(Map<String, ?> payload) {
        return request("POST", "/openapi/game/task/report", Map.of(), payload);
    }

    public Object queryGameTaskResult(Map<String, ?> query) {
        return request("GET", "/openapi/game/task/result", query, Map.of());
    }

    public Object queryReport(String reportId) {
        return request("GET", "/openapi/report/query", Map.of("reportId", reportId), Map.of());
    }

    private Object request(String method, String path, Map<String, ?> query, Map<String, ?> body) {
        Map<String, Object> cleanQuery = CidiSignature.removeEmptyValues(query);
        Map<String, Object> cleanBody = CidiSignature.removeEmptyValues(body);
        Map<String, Object> signParams = "POST".equals(method) ? cleanBody : cleanQuery;
        String timestamp = Long.toString(CidiSignature.nowInSeconds());
        String nonce = CidiSignature.createNonce();

        try {
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(config.getCidiBaseUrl() + path + buildQueryString(cleanQuery)))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("X-Api-Key", config.getCidiApiKey())
                    .header("X-Timestamp", timestamp)
                    .header("X-Nonce", nonce)
                    .header("X-Signature", CidiSignature.generateSignature(
                            signParams,
                            timestamp,
                            nonce,
                            config.getCidiApiSecret()
                    ));

            if ("POST".equals(method)) {
                builder.POST(HttpRequest.BodyPublishers.ofString(MAPPER.writeValueAsString(cleanBody)));
            } else {
                builder.GET();
            }

            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            Object parsed = parseResponse(response.body());
            if (response.statusCode() >= 400) {
                Map<String, Object> error = new LinkedHashMap<>();
                error.put("message", "CiDi OpenAPI request failed");
                error.put("statusCode", response.statusCode());
                error.put("response", parsed);
                throw new ResponseStatusException(HttpStatus.valueOf(response.statusCode()), MAPPER.writeValueAsString(error));
            }
            return parsed;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, e.getMessage(), e);
        }
    }

    private static Object parseResponse(String body) throws IOException {
        if (body == null || body.isBlank()) {
            return Map.of();
        }
        try {
            return MAPPER.readValue(body, new TypeReference<Object>() {
            });
        } catch (IOException e) {
            return Map.of("raw", body);
        }
    }

    private static String buildQueryString(Map<String, Object> query) {
        if (query.isEmpty()) {
            return "";
        }

        StringJoiner joiner = new StringJoiner("&", "?", "");
        for (Map.Entry<String, Object> entry : query.entrySet()) {
            joiner.add(urlEncode(entry.getKey()) + "=" + urlEncode(CidiSignature.stringifySignValue(entry.getValue())));
        }
        return joiner.toString();
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
