package cidi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/config"
)

type Client struct {
	config     config.Config
	httpClient *http.Client
}

func NewClient(cfg config.Config) *Client {
	return &Client{
		config: cfg,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (c *Client) VerifyTempToken(tempToken string) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/user/verify", SignableParams{"tempToken": tempToken}, nil)
}

func (c *Client) QueryBalance(gameToken string) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/coin/balance", SignableParams{"gameToken": gameToken}, nil)
}

func (c *Client) CreateOrder(payload SignableParams) (any, int, error) {
	return c.request(http.MethodPost, "/openapi/order/create", nil, payload)
}

func (c *Client) QueryOrder(orderNo string) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/order/"+url.PathEscape(orderNo), SignableParams{}, nil)
}

func (c *Client) QueryOrderByGameOrderNo(gameOrderNo string) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/order/by-game-order", SignableParams{"gameOrderNo": gameOrderNo}, nil)
}

func (c *Client) QueryOrderRecords(query SignableParams) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/order/records", query, nil)
}

func (c *Client) ReportMedal(payload SignableParams) (any, int, error) {
	return c.request(http.MethodPost, "/openapi/game/medal/report", nil, payload)
}

func (c *Client) QueryMedalOwnership(query SignableParams) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/game/medal/ownership", query, nil)
}

func (c *Client) ReportTournamentScore(payload SignableParams) (any, int, error) {
	return c.request(http.MethodPost, "/openapi/tournament/score", nil, payload)
}

func (c *Client) ReportGameTask(payload SignableParams) (any, int, error) {
	return c.request(http.MethodPost, "/openapi/game/task/report", nil, payload)
}

func (c *Client) QueryGameTaskResult(query SignableParams) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/game/task/result", query, nil)
}

func (c *Client) QueryReport(reportID string) (any, int, error) {
	return c.request(http.MethodGet, "/openapi/report/query", SignableParams{"reportId": reportID}, nil)
}

func (c *Client) request(method string, path string, query SignableParams, body SignableParams) (any, int, error) {
	cleanQuery := RemoveEmptyValues(query)
	cleanBody := RemoveEmptyValues(body)
	signParams := cleanQuery
	if method == http.MethodPost {
		signParams = cleanBody
	}

	requestURL, err := url.Parse(c.config.CidiBaseURL + path)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	q := requestURL.Query()
	for key, value := range cleanQuery {
		q.Set(key, StringifySignValue(value))
	}
	requestURL.RawQuery = q.Encode()

	var reader io.Reader
	if method == http.MethodPost {
		bodyBytes, err := json.Marshal(cleanBody)
		if err != nil {
			return nil, http.StatusBadRequest, err
		}
		reader = bytes.NewReader(bodyBytes)
	}

	req, err := http.NewRequest(method, requestURL.String(), reader)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}

	req.Header.Set("Content-Type", "application/json")
	timestamp := fmt.Sprintf("%d", NowInSeconds())
	nonce := CreateNonce()
	req.Header.Set("X-Api-Key", c.config.CidiAPIKey)
	req.Header.Set("X-Timestamp", timestamp)
	req.Header.Set("X-Nonce", nonce)
	req.Header.Set("X-Signature", GenerateSignature(signParams, timestamp, nonce, c.config.CidiAPISecret))

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, http.StatusBadGateway, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, http.StatusBadGateway, err
	}

	parsed := parseJSONResponse(respBody)
	if resp.StatusCode >= 400 {
		return map[string]any{
			"message":    "CiDi OpenAPI request failed",
			"statusCode": resp.StatusCode,
			"response":   parsed,
		}, resp.StatusCode, nil
	}

	return parsed, resp.StatusCode, nil
}

func parseJSONResponse(body []byte) any {
	if len(body) == 0 {
		return map[string]any{}
	}

	var parsed any
	decoder := json.NewDecoder(bytes.NewReader(body))
	decoder.UseNumber()
	if err := decoder.Decode(&parsed); err != nil {
		return map[string]any{"raw": strings.TrimSpace(string(body))}
	}
	return parsed
}
