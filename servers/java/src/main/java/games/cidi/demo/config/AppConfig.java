package games.cidi.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AppConfig {
    private final String cidiBaseUrl;
    private final String cidiApiKey;
    private final String cidiApiSecret;
    private final String cidiCallbackSecret;

    public AppConfig(
            @Value("${CIDI_BASE_URL:https://openapi-tst.cidi.games}") String cidiBaseUrl,
            @Value("${CIDI_API_KEY:}") String cidiApiKey,
            @Value("${CIDI_API_SECRET:}") String cidiApiSecret,
            @Value("${CIDI_CALLBACK_SECRET:}") String cidiCallbackSecret
    ) {
        this.cidiBaseUrl = cidiBaseUrl.replaceAll("/+$", "");
        this.cidiApiKey = cidiApiKey;
        this.cidiApiSecret = cidiApiSecret;
        this.cidiCallbackSecret = cidiCallbackSecret;
    }

    public String getCidiBaseUrl() {
        return cidiBaseUrl;
    }

    public String getCidiApiKey() {
        return cidiApiKey;
    }

    public String getCidiApiSecret() {
        return cidiApiSecret;
    }

    public String getCidiCallbackSecret() {
        return cidiCallbackSecret;
    }
}
