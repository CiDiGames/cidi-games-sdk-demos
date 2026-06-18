package games.cidi.demo.cidi;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

public final class CidiSignature {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final SecureRandom RANDOM = new SecureRandom();

    private CidiSignature() {
    }

    public static String createNonce() {
        byte[] bytes = new byte[16];
        RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    public static long nowInSeconds() {
        return Instant.now().getEpochSecond();
    }

    public static String buildSignString(Map<String, ?> params, String timestamp, String nonce) {
        String businessParams = params.entrySet().stream()
                .filter(entry -> shouldSignValue(entry.getValue()))
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(entry -> entry.getKey() + "=" + stringifySignValue(entry.getValue()))
                .collect(Collectors.joining("&"));

        if (businessParams.isEmpty()) {
            return "timestamp=" + timestamp + "&nonce=" + nonce;
        }

        return businessParams + "&timestamp=" + timestamp + "&nonce=" + nonce;
    }

    public static String generateSignature(Map<String, ?> params, String timestamp, String nonce, String secret) {
        try {
            String signString = buildSignString(params, timestamp, nonce);
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(signString.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate CIDI signature", e);
        }
    }

    public static boolean verifySignature(
            Map<String, ?> params,
            String timestamp,
            String nonce,
            String signature,
            String secret
    ) {
        String expected = generateSignature(params, timestamp, nonce, secret);
        return constantTimeEquals(expected, signature);
    }

    public static Map<String, Object> removeEmptyValues(Map<String, ?> params) {
        Map<String, Object> cleaned = new LinkedHashMap<>();
        for (Map.Entry<String, ?> entry : params.entrySet()) {
            if (shouldSignValue(entry.getValue())) {
                cleaned.put(entry.getKey(), entry.getValue());
            }
        }
        return cleaned;
    }

    public static String stringifySignValue(Object value) {
        if (value instanceof String text) {
            return text;
        }
        if (value instanceof Boolean bool) {
            return Boolean.toString(bool);
        }
        if (value instanceof Number number) {
            return number.toString();
        }
        try {
            return MAPPER.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return Objects.toString(value);
        }
    }

    private static boolean shouldSignValue(Object value) {
        return value != null && !Objects.toString(value).isEmpty();
    }

    private static boolean constantTimeEquals(String left, String right) {
        if (right == null) {
            return false;
        }

        byte[] leftBytes = left.getBytes(StandardCharsets.UTF_8);
        byte[] rightBytes = right.getBytes(StandardCharsets.UTF_8);
        if (leftBytes.length != rightBytes.length) {
            return false;
        }

        int diff = 0;
        for (int i = 0; i < leftBytes.length; i++) {
            diff |= leftBytes[i] ^ rightBytes[i];
        }
        return diff == 0;
    }
}
