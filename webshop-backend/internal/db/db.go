package main

import (
	"log"
	"net/http"

	"webshop-backend/internal/handlers"
)

func main() {
	mux := http.NewServeMux()

	// API routes
	mux.HandleFunc("/api/health", handlers.Health)
	mux.HandleFunc("/api/producten", handlers.Producten)

	log.Println("Server draait op http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
