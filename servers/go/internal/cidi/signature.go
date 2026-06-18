package cidi

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"
)

type SignableParams map[string]any

func CreateNonce() string {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return strconv.FormatInt(time.Now().UnixNano(), 10)
	}
	return hex.EncodeToString(bytes)
}

func NowInSeconds() int64 {
	return time.Now().Unix()
}

func BuildSignString(params SignableParams, timestamp string, nonce string) string {
	keys := make([]string, 0, len(params))
	for key, value := range params {
		if shouldSignValue(value) {
			keys = append(keys, key)
		}
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys)+2)
	for _, key := range keys {
		parts = append(parts, key+"="+StringifySignValue(params[key]))
	}

	parts = append(parts, "timestamp="+timestamp)
	parts = append(parts, "nonce="+nonce)

	return strings.Join(parts, "&")
}

func GenerateSignature(params SignableParams, timestamp string, nonce string, secret string) string {
	signString := BuildSignString(params, timestamp, nonce)
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signString))
	return hex.EncodeToString(mac.Sum(nil))
}

func VerifySignature(params SignableParams, timestamp string, nonce string, signature string, secret string) bool {
	expected := GenerateSignature(params, timestamp, nonce, secret)
	return hmac.Equal([]byte(expected), []byte(signature))
}

func RemoveEmptyValues(params SignableParams) SignableParams {
	cleaned := SignableParams{}
	for key, value := range params {
		if shouldSignValue(value) {
			cleaned[key] = value
		}
	}
	return cleaned
}

func StringifySignValue(value any) string {
	switch typed := value.(type) {
	case string:
		return typed
	case bool:
		return strconv.FormatBool(typed)
	case int:
		return strconv.Itoa(typed)
	case int64:
		return strconv.FormatInt(typed, 10)
	case float64:
		return strconv.FormatFloat(typed, 'f', -1, 64)
	case float32:
		return strconv.FormatFloat(float64(typed), 'f', -1, 32)
	case json.Number:
		return typed.String()
	default:
		bytes, err := json.Marshal(typed)
		if err == nil {
			return string(bytes)
		}
		return fmt.Sprint(typed)
	}
}

func shouldSignValue(value any) bool {
	if value == nil {
		return false
	}
	return fmt.Sprint(value) != ""
}
