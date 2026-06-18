package demo

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/cidi"
)

type Handler struct {
	cidi *cidi.Client
}

func NewHandler(cidiClient *cidi.Client) *Handler {
	return &Handler{cidi: cidiClient}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/health", h.health)
	mux.HandleFunc("/demo/verify", h.verifyTempToken)
	mux.HandleFunc("/demo/balance", h.queryBalance)
	mux.HandleFunc("/demo/orders/by-game-order/", h.queryOrderByGameOrderNo)
	mux.HandleFunc("/demo/orders/", h.queryOrder)
	mux.HandleFunc("/demo/orders", h.createOrder)
	mux.HandleFunc("/demo/order-records", h.queryOrderRecords)
	mux.HandleFunc("/demo/medal/report", h.reportMedal)
	mux.HandleFunc("/demo/medal/ownership", h.queryMedalOwnership)
	mux.HandleFunc("/demo/tournament/score", h.reportTournamentScore)
	mux.HandleFunc("/demo/task/report", h.reportGameTask)
	mux.HandleFunc("/demo/task/result", h.queryGameTaskResult)
	mux.HandleFunc("/demo/report/", h.queryReport)
}

func (h *Handler) health(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"ok":        true,
		"service":   "cidi-go-demo",
		"timestamp": time.Now().Unix(),
	})
}

func (h *Handler) verifyTempToken(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}

	body, ok := readJSONBody(w, r)
	if !ok {
		return
	}

	tempToken, ok := readRequiredString(w, body["tempToken"], "tempToken")
	if !ok {
		return
	}

	result, status, err := h.cidi.VerifyTempToken(tempToken)
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) queryBalance(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	result, status, err := h.cidi.QueryBalance(r.URL.Query().Get("gameToken"))
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) createOrder(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}

	body, ok := readJSONBody(w, r)
	if !ok {
		return
	}

	gameToken, ok := readRequiredString(w, body["gameToken"], "gameToken")
	if !ok {
		return
	}

	amount, ok := readRequiredNumber(w, body["amount"], "amount")
	if !ok {
		return
	}

	payload := cidi.SignableParams{
		"gameOrderNo": readOptionalString(body["gameOrderNo"]),
		"gameToken":   gameToken,
		"amount":      amount,
	}
	if payload["gameOrderNo"] == "" {
		payload["gameOrderNo"] = createGameOrderNo()
	}
	copyOptionalString(payload, body, "description", "description")
	copyOptionalString(payload, body, "metadata", "metadata")
	copyOptionalString(payload, body, "callback_url", "callback_url")
	if payload["callback_url"] == nil || payload["callback_url"] == "" {
		copyOptionalString(payload, body, "callbackUrl", "callback_url")
	}

	result, status, err := h.cidi.CreateOrder(payload)
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) queryOrder(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	orderNo := strings.TrimPrefix(r.URL.Path, "/demo/orders/")
	result, status, err := h.cidi.QueryOrder(orderNo)
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) queryOrderByGameOrderNo(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	gameOrderNo := strings.TrimPrefix(r.URL.Path, "/demo/orders/by-game-order/")
	result, status, err := h.cidi.QueryOrderByGameOrderNo(gameOrderNo)
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) queryOrderRecords(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	result, status, err := h.cidi.QueryOrderRecords(queryParams(r))
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) reportMedal(w http.ResponseWriter, r *http.Request) {
	h.forwardBody(w, r, http.MethodPost, h.cidi.ReportMedal)
}

func (h *Handler) queryMedalOwnership(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	result, status, err := h.cidi.QueryMedalOwnership(queryParams(r))
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) reportTournamentScore(w http.ResponseWriter, r *http.Request) {
	h.forwardBody(w, r, http.MethodPost, h.cidi.ReportTournamentScore)
}

func (h *Handler) reportGameTask(w http.ResponseWriter, r *http.Request) {
	h.forwardBody(w, r, http.MethodPost, h.cidi.ReportGameTask)
}

func (h *Handler) queryGameTaskResult(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	result, status, err := h.cidi.QueryGameTaskResult(queryParams(r))
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) queryReport(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodGet) {
		return
	}

	reportID := strings.TrimPrefix(r.URL.Path, "/demo/report/")
	result, status, err := h.cidi.QueryReport(reportID)
	writeOpenAPIResult(w, result, status, err)
}

func (h *Handler) forwardBody(w http.ResponseWriter, r *http.Request, method string, fn func(cidi.SignableParams) (any, int, error)) {
	if !requireMethod(w, r, method) {
		return
	}

	body, ok := readJSONBody(w, r)
	if !ok {
		return
	}

	result, status, err := fn(body)
	writeOpenAPIResult(w, result, status, err)
}

func readJSONBody(w http.ResponseWriter, r *http.Request) (cidi.SignableParams, bool) {
	defer r.Body.Close()

	var body cidi.SignableParams
	decoder := json.NewDecoder(r.Body)
	decoder.UseNumber()
	if err := decoder.Decode(&body); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": "invalid JSON body"})
		return nil, false
	}

	return body, true
}

func queryParams(r *http.Request) cidi.SignableParams {
	params := cidi.SignableParams{}
	for key, values := range r.URL.Query() {
		if len(values) > 0 {
			params[key] = values[0]
		}
	}
	return params
}

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		w.Header().Set("Allow", method)
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"message": "method not allowed"})
		return false
	}
	return true
}

func readRequiredString(w http.ResponseWriter, value any, field string) (string, bool) {
	text, ok := value.(string)
	if !ok || strings.TrimSpace(text) == "" {
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": field + " is required"})
		return "", false
	}
	return text, true
}

func readOptionalString(value any) string {
	text, ok := value.(string)
	if !ok {
		return ""
	}
	return strings.TrimSpace(text)
}

func readRequiredNumber(w http.ResponseWriter, value any, field string) (any, bool) {
	switch typed := value.(type) {
	case json.Number:
		return typed, true
	case float64:
		return typed, true
	case int:
		return typed, true
	default:
		writeJSON(w, http.StatusBadRequest, map[string]any{"message": field + " must be a number"})
		return nil, false
	}
}

func copyOptionalString(target cidi.SignableParams, source cidi.SignableParams, sourceKey string, targetKey string) {
	value := readOptionalString(source[sourceKey])
	if value != "" {
		target[targetKey] = value
	}
}

func createGameOrderNo() string {
	return "GAME" + strings.ReplaceAll(time.Now().Format("20060102150405.000000000"), ".", "")
}

func writeOpenAPIResult(w http.ResponseWriter, result any, status int, err error) {
	if err != nil {
		writeJSON(w, status, map[string]any{"message": err.Error()})
		return
	}
	writeJSON(w, status, result)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
