package handler

import (
	"encoding/json"
	"log"
	"myproject/dto"
	"myproject/shortener"
	"net/http"
)

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
	// Kiểm tra method (Giữ lại nếu bạn không dùng router)
	if r.Method != http.MethodPost {
		HandleError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Decode request body (Phần này đã clean)
	var req dto.ShortenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		HandleError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Xử lý UserID (Clean và an toàn hơn)
	var finalUserID *int
	// Lấy giá trị từ context
	ctxUserID := r.Context().Value("userID")

	// Kiểm tra an toàn (safe type assertion)
	if ctxUserID != nil {
		if userID, ok := ctxUserID.(int); ok && userID != 0 {
			finalUserID = &userID
		}
		// Nếu assertion thất bại hoặc userID là 0, finalUserID vẫn là nil
	}

	log.Printf("Handler received userID: %v", finalUserID)

	code := shortener.Shorten(req.URL, finalUserID)

	w.Header().Set("Content-Type", "application/json") // Nên set content type
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
