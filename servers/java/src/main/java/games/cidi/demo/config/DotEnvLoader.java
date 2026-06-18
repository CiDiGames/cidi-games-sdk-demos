package games.cidi.demo.config;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

public final class DotEnvLoader {
    private DotEnvLoader() {
    }

    public static void load() {
        Path path = Path.of(".env");
        if (Files.exists(path)) {
            try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
                String line;
                while ((line = reader.readLine()) != null) {
                    loadLine(line);
                }
            } catch (IOException ignored) {
                // Keep local .env loading best-effort for the demo server.
            }
        }

        configureServerPort();
    }

    private static void loadLine(String line) {
        String trimmed = line.trim();
        if (trimmed.isEmpty() || trimmed.startsWith("#")) {
            return;
        }

        int index = trimmed.indexOf('=');
        if (index <= 0) {
            return;
        }

        String key = trimmed.substring(0, index).trim();
        String value = stripQuotes(trimmed.substring(index + 1).trim());
        if (!key.isEmpty() && System.getenv(key) == null && System.getProperty(key) == null) {
            System.setProperty(key, value);
            if ("PORT".equals(key) && System.getProperty("server.port") == null) {
                System.setProperty("server.port", value);
            }
        }
    }

    private static void configureServerPort() {
        if (System.getProperty("server.port") != null) {
            return;
        }

        String port = System.getProperty("PORT");
        if (port == null || port.isBlank()) {
            port = System.getenv("PORT");
        }
        if (port == null || port.isBlank()) {
            port = "3003";
        }

        System.setProperty("server.port", port);
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
