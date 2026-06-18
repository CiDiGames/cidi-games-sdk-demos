package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/callbacks"
	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/cidi"
	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/config"
	"github.com/CiDiGames/cidi-games-sdk-demos/servers/go/internal/demo"
)

func main() {
	cfg := config.Load()
	cidiClient := cidi.NewClient(cfg)

	mux := http.NewServeMux()
	demo.NewHandler(cidiClient).Register(mux)
	callbacks.NewHandler(cfg).Register(mux)

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("CIDI Go demo server listening on %s", addr)
	if err := http.ListenAndServe(addr, withCORS(mux)); err != nil {
		log.Fatal(err)
	}
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, X-Timestamp, X-Nonce, X-Signature")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
