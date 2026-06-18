package callbacks

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/cidi"
	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/config"
)

func TestReceiveOrderPaidVerifiesSignature(t *testing.T) {
	handler := NewHandler(config.Config{CidiCallbackSecret: "callback-secret"})
	body := cidi.SignableParams{
		"event":       "order.paid",
		"orderNo":     "CIDI123",
		"gameOrderNo": "GAME123",
		"amount":      10,
		"metadata":    "demo",
	}
	bodyBytes, err := json.Marshal(body)
	if err != nil {
		t.Fatal(err)
	}

	timestamp := "1768393700"
	nonce := "f47ac10b58cc4d"
	signature := cidi.GenerateSignature(body, timestamp, nonce, "callback-secret")

	req := httptest.NewRequest(http.MethodPost, "/callbacks/order-paid", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Timestamp", timestamp)
	req.Header.Set("X-Nonce", nonce)
	req.Header.Set("X-Signature", signature)

	recorder := httptest.NewRecorder()
	handler.receiveOrderPaid(recorder, req)

	assertJSONResponse(t, recorder, http.StatusOK, map[string]any{
		"code":    float64(0),
		"message": "success",
	})
}

func TestReceiveOrderPaidRejectsInvalidSignature(t *testing.T) {
	handler := NewHandler(config.Config{CidiCallbackSecret: "callback-secret"})
	bodyBytes := []byte(`{"event":"order.paid","orderNo":"CIDI123","gameOrderNo":"GAME123","amount":10}`)

	req := httptest.NewRequest(http.MethodPost, "/callbacks/order-paid", bytes.NewReader(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Timestamp", "1768393700")
	req.Header.Set("X-Nonce", "f47ac10b58cc4d")
	req.Header.Set("X-Signature", "bad")

	recorder := httptest.NewRecorder()
	handler.receiveOrderPaid(recorder, req)

	assertJSONResponse(t, recorder, http.StatusOK, map[string]any{
		"code":    float64(1004),
		"message": "invalid callback signature",
	})
}

func assertJSONResponse(t *testing.T, recorder *httptest.ResponseRecorder, status int, expected map[string]any) {
	t.Helper()

	if recorder.Code != status {
		t.Fatalf("unexpected status: want %d got %d", status, recorder.Code)
	}

	var actual map[string]any
	if err := json.Unmarshal(recorder.Body.Bytes(), &actual); err != nil {
		t.Fatal(err)
	}

	for key, expectedValue := range expected {
		if actual[key] != expectedValue {
			t.Fatalf("unexpected %s: want %#v got %#v", key, expectedValue, actual[key])
		}
	}
}
