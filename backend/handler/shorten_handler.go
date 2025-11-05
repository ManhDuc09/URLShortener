package handler

import (
	"encoding/json"
	"myproject/shortener"
	"net/http"
)

type ShortenRequest struct {
	URL    string `json:"url"`
	UserID int    `json:"user_id"`
}

type DeleteRequest struct {
	Code   string `json:"code"`
	UserID int    `json:"user_id"`
}

func ShortenURL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	code := shortener.Shorten(req.URL, req.UserID)

	json.NewEncoder(w).Encode(map[string]string{"short_code": code.ShortCode})
}

func ResolveURL(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Path[1:]
	url, ok := shortener.Resolve(code)
	if ok == false {
		http.Error(w, "Not found", http.StatusNotFound)
		return
	}
	http.Redirect(w, r, url.OriginalURL, http.StatusFound)
}

func DeleteURL(w http.ResponseWriter, r *http.Request) {
	var req DeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if req.Code == "" {
		http.Error(w, "Missing code", http.StatusBadRequest)
		return
	}

	ok, msg := shortener.Delete(req.Code, req.UserID)
	if ok {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(msg))
	} else {
		if msg == "Code not found" {
			http.Error(w, msg, http.StatusNotFound)
		} else {
			http.Error(w, msg, http.StatusForbidden)
		}
	}
}
