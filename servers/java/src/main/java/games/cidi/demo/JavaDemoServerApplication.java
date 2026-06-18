package games.cidi.demo;

import games.cidi.demo.config.DotEnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class JavaDemoServerApplication {
    public static void main(String[] args) {
        DotEnvLoader.load();
        SpringApplication.run(JavaDemoServerApplication.class, args);
    }
}
