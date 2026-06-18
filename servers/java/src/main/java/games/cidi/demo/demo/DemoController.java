package games.cidi.demo.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class DemoController {
    private final DemoService demo;

    public DemoController(DemoService demo) {
        this.demo = demo;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        return demo.health();
    }

    @PostMapping("/demo/verify")
    public Object verifyTempToken(@RequestBody Map<String, Object> body) {
        return demo.verifyTempToken(body.get("tempToken"));
    }

    @GetMapping("/demo/balance")
    public Object queryBalance(@RequestParam("gameToken") String gameToken) {
        return demo.queryBalance(gameToken);
    }

    @PostMapping("/demo/orders")
    public Object createOrder(@RequestBody Map<String, Object> body) {
        return demo.createOrder(body);
    }

    @GetMapping("/demo/orders/by-game-order/{gameOrderNo}")
    public Object queryOrderByGameOrderNo(@PathVariable String gameOrderNo) {
        return demo.queryOrderByGameOrderNo(gameOrderNo);
    }

    @GetMapping("/demo/orders/{orderNo}")
    public Object queryOrder(@PathVariable String orderNo) {
        return demo.queryOrder(orderNo);
    }

    @GetMapping("/demo/order-records")
    public Object queryOrderRecords(@RequestParam Map<String, String> query) {
        return demo.queryOrderRecords(query);
    }

    @PostMapping("/demo/medal/report")
    public Object reportMedal(@RequestBody Map<String, Object> body) {
        return demo.reportMedal(body);
    }

    @GetMapping("/demo/medal/ownership")
    public Object queryMedalOwnership(@RequestParam Map<String, String> query) {
        return demo.queryMedalOwnership(query);
    }

    @PostMapping("/demo/tournament/score")
    public Object reportTournamentScore(@RequestBody Map<String, Object> body) {
        return demo.reportTournamentScore(body);
    }

    @PostMapping("/demo/task/report")
    public Object reportGameTask(@RequestBody Map<String, Object> body) {
        return demo.reportGameTask(body);
    }

    @GetMapping("/demo/task/result")
    public Object queryGameTaskResult(@RequestParam Map<String, String> query) {
        return demo.queryGameTaskResult(query);
    }

    @GetMapping("/demo/report/{reportId}")
    public Object queryReport(@PathVariable String reportId) {
        return demo.queryReport(reportId);
    }
}
