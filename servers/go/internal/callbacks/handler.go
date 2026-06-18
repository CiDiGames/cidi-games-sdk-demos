package callbacks

import (
	"encoding/json"
	"net/http"
	"sync"

	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/cidi"
	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/config"
)

type Handler struct {
	config              config.Config
	paidGameOrderNos    map[string]bool
	tournamentReportIDs map[string]bool
	mu                  sync.Mutex
}

func NewHandler(cfg config.Config) *Handler {
	return &Handler{
		config:              cfg,
		paidGameOrderNos:    map[string]bool{},
		tournamentReportIDs: map[string]bool{},
	}
}

func (h *Handler) Register(mux *http.ServeMux) {
	mux.HandleFunc("/callbacks/order-paid", h.receiveOrderPaid)
	mux.HandleFunc("/callbacks/tournament-score", h.receiveTournamentScore)
}

func (h *Handler) receiveOrderPaid(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}

	body, ok := readJSONBody(w, r)
	if !ok {
		return
	}

	if h.config.CidiCallbackSecret == "" {
		writeJSON(w, http.StatusOK, map[string]any{
			"code":    1002,
			"message": "callback secret is not configured",
		})
		return
	}

	timestamp := r.Header.Get("X-Timestamp")
	nonce := r.Header.Get("X-Nonce")
	signature := r.Header.Get("X-Signature")
	if timestamp == "" || nonce == "" || signature == "" {
		writeJSON(w, http.StatusOK, map[string]any{
			"code":    1003,
			"message": "missing callback signature headers",
		})
		return
	}

	if !cidi.VerifySignature(body, timestamp, nonce, signature, h.config.CidiCallbackSecret) {
		writeJSON(w, http.StatusOK, map[string]any{
			"code":    1004,
			"message": "invalid callback signature",
		})
		return
	}

	gameOrderNo := cidi.StringifySignValue(body["gameOrderNo"])
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.paidGameOrderNos[gameOrderNo] {
		writeJSON(w, http.StatusOK, map[string]any{
			"code":    0,
			"message": "duplicate callback ignored",
		})
		return
	}

	h.paidGameOrderNos[gameOrderNo] = true
	writeJSON(w, http.StatusOK, map[string]any{
		"code":    0,
		"message": "success",
	})
}

func (h *Handler) receiveTournamentScore(w http.ResponseWriter, r *http.Request) {
	if !requireMethod(w, r, http.MethodPost) {
		return
	}

	body, ok := readJSONBody(w, r)
	if !ok {
		return
	}

	reportID := cidi.StringifySignValue(body["reportId"])
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.tournamentReportIDs[reportID] {
		writeJSON(w, http.StatusOK, map[string]any{
			"code":    0,
			"message": "duplicate callback ignored",
		})
		return
	}

	h.tournamentReportIDs[reportID] = true
	writeJSON(w, http.StatusOK, map[string]any{
		"code":    0,
		"message": "success",
	})
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

func requireMethod(w http.ResponseWriter, r *http.Request, method string) bool {
	if r.Method != method {
		w.Header().Set("Allow", method)
		writeJSON(w, http.StatusMethodNotAllowed, map[string]any{"message": "method not allowed"})
		return false
	}
	return true
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
