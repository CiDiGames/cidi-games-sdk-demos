package games.cidi.demo.cidi;

import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CidiSignatureTest {
    private static final String TIMESTAMP = "1768393700";
    private static final String NONCE = "f47ac10b58cc4d";
    private static final String SECRET = "secret";

    @Test
    void generateSignatureMatchesOtherDemoServers() {
        assertSignature(
                mapOf(
                        "gameToken", "abc123",
                        "startTime", 1768390000,
                        "endTime", 1768393600
                ),
                "endTime=1768393600&gameToken=abc123&startTime=1768390000&timestamp=1768393700&nonce=f47ac10b58cc4d",
                "4710f9a07ab2ef02ce4fcc6bcb67c76c980e6becb4354940569790e50f2a6cc2"
        );

        assertSignature(
                mapOf(
                        "gameToken", "abc123",
                        "empty", "",
                        "nil", null,
                        "amount", 10
                ),
                "amount=10&gameToken=abc123&timestamp=1768393700&nonce=f47ac10b58cc4d",
                "377289d5383a901084fd3a85bce51c115e37cb2555b687fb23ee45dfe00b760c"
        );

        assertSignature(
                mapOf(
                        "gameToken", "abc123",
                        "success", true,
                        "enabled", false
                ),
                "enabled=false&gameToken=abc123&success=true&timestamp=1768393700&nonce=f47ac10b58cc4d",
                "853a06e9382605d33354df8022bd752bfa7d1936b022c298ea7a15830b7ae581"
        );

        assertSignature(
                mapOf(
                        "gameToken", "abc123",
                        "amount", 10.5
                ),
                "amount=10.5&gameToken=abc123&timestamp=1768393700&nonce=f47ac10b58cc4d",
                "f14e0d9ae0bea1b858868cb472036d5bdd33b176c80c4246a4f1fbf91e6abe97"
        );
    }

    @Test
    void stringMetadataCanCarryJsonWithoutChangingSignatureOrder() {
        Map<String, Object> params = mapOf(
                "gameToken", "abc123",
                "metadata", "{\"level\":3,\"item\":\"sword\"}",
                "tags", "[\"a\",\"b\"]"
        );

        assertEquals(
                "gameToken=abc123&metadata={\"level\":3,\"item\":\"sword\"}&tags=[\"a\",\"b\"]&timestamp=1768393700&nonce=f47ac10b58cc4d",
                CidiSignature.buildSignString(params, TIMESTAMP, NONCE)
        );
    }

    private void assertSignature(Map<String, Object> params, String signString, String signature) {
        assertEquals(signString, CidiSignature.buildSignString(params, TIMESTAMP, NONCE));
        assertEquals(signature, CidiSignature.generateSignature(params, TIMESTAMP, NONCE, SECRET));
    }

    private static Map<String, Object> mapOf(Object... values) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (int i = 0; i < values.length; i += 2) {
            map.put((String) values[i], values[i + 1]);
        }
        return map;
    }
}
