package handler

import (
	"encoding/json"
	"myproject/shortener"
	"net/http"
)

type ShortenRequest struct {
	URL string `json:"url"`
}

func ShortenURL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	code := shortener.Shorten(req.URL)

	resp := map[string]string{"short_code": code}
	json.NewEncoder(w).Encode(resp)
}

func ResolveURL(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Path[1:]
	url := shortener.Resolve(code)
	if url == "" {
		http.NotFound(w, r)
		return
	}
	http.Redirect(w, r, url, http.StatusFound)
}
