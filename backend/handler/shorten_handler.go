package handler

import (
	"encoding/json"
	"log"
	"myproject/dto"
	"myproject/shortener"
	"net/http"
)

var jwtKey = []byte("my_secret_key")

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		HandleError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req dto.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		HandleError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	_, err := shortener.RegisterUser(req.Name, req.Email, req.Password)
	if err != nil {
		HandleError(w, http.StatusInternalServerError, err.Error())
		return
	}

	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(map[string]string{"message": "User registered successfully"}); err != nil {
		HandleError(w, http.StatusInternalServerError, "Failed to write response")
		return
	}
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		HandleError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req dto.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		HandleError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	token, err := shortener.AuthenticateUser(req.Email, req.Password)
	if err != nil {
		HandleError(w, http.StatusUnauthorized, err.Error())
		return
	}

	if err := json.NewEncoder(w).Encode(dto.LoginResponse{Token: token}); err != nil {
		HandleError(w, http.StatusInternalServerError, "Failed to write response")
		return
	}
}

func ShortenURL(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		HandleError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	var req dto.ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		HandleError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Extract UserID from context, default to 0 if not logged in
	userID := 0
	if ctxUserID := r.Context().Value("userID"); ctxUserID != nil {
		userID = ctxUserID.(int)
	}

	// Đảm bảo userID là nil nếu không có giá trị hợp lệ
	var finalUserID *int
	if userID != 0 {
		finalUserID = &userID
	}

	log.Printf("Handler received userID: %v", finalUserID)

	code := shortener.Shorten(req.URL, finalUserID)

	if err := json.NewEncoder(w).Encode(map[string]string{"short_code": code.ShortCode}); err != nil {
		HandleError(w, http.StatusInternalServerError, "Failed to write response")
		return
	}
}

func ResolveURL(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Path[1:]
	url, ok := shortener.Resolve(code)
	if ok == false {
		HandleError(w, http.StatusNotFound, "Not found")
		return
	}
	http.Redirect(w, r, url.OriginalURL, http.StatusFound)
}

func DeleteURL(w http.ResponseWriter, r *http.Request) {
	var req dto.DeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		HandleError(w, http.StatusBadRequest, "Invalid body")
		return
	}

	if req.Code == "" {
		HandleError(w, http.StatusBadRequest, "Missing code")
		return
	}

	ok, msg := shortener.Delete(req.Code, req.UserID)
	if ok {
		w.WriteHeader(http.StatusOK)
		if _, err := w.Write([]byte(msg)); err != nil {
			HandleError(w, http.StatusInternalServerError, "Failed to write response")
			return
		}
	} else {
		if msg == "Code not found" {
			HandleError(w, http.StatusNotFound, msg)
		} else {
			HandleError(w, http.StatusForbidden, msg)
		}
	}
}
