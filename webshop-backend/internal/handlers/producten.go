package handlers

// snelle test zonder db
import (
	"encoding/json"
	"net/http"
)

type Product struct {
	ID    int     `json:"id"`
	Naam  string  `json:"naam"`
	Prijs float64 `json:"prijs"`
}

func Producten(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*") // handig voor React dev

	data := []Product{
		{ID: 1, Naam: "Testproduct", Prijs: 9.99},
	}

	json.NewEncoder(w).Encode(data)
}
