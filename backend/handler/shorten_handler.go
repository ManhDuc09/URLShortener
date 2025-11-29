package handler

import (
	"encoding/json"
	"log"
	"math"
	"myproject/dto"
	"myproject/shortener"
	"net/http"
	"strconv"
)

// Register godoc
// @Summary Register a new user
// @Description Create a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "User registration info"
// @Success 201 {object} map[string]string
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /register [post]
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

// Login godoc
// @Summary Login user
// @Description Authenticate user and return JWT token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login credentials"
// @Success 200 {object} dto.LoginResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /login [post]
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

	token, userName, err := shortener.AuthenticateUser(req.Email, req.Password)
	if err != nil {
		HandleError(w, http.StatusUnauthorized, err.Error())
		return
	}

	if err := json.NewEncoder(w).Encode(dto.LoginResponse{Token: token, Username: userName}); err != nil {
		HandleError(w, http.StatusInternalServerError, "Failed to write response")
		return
	}
}

// ShortenURL godoc
// @Summary Shorten a URL
// @Description Create a short URL (can be anonymous or authenticated)
// @Tags shortener
// @Accept json
// @Produce json
// @Param request body dto.ShortenRequest true "URL to shorten"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]interface{}
// @Router /shorten-public [post]
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

// ResolveURL godoc
// @Summary Resolve short code to original URL
// @Description Redirect to original URL and increment click counter
// @Tags shortener
// @Param code path string true "Short code"
// @Success 302 "Redirect to original URL"
// @Failure 404 {object} map[string]interface{}
// @Router /{code} [get]
func ResolveURL(w http.ResponseWriter, r *http.Request) {
	code := r.URL.Path[1:]
	url, ok := shortener.Resolve(code)
	if ok == false {
		HandleError(w, http.StatusNotFound, "Not found")
		return
	}
	http.Redirect(w, r, url.OriginalURL, http.StatusFound)
}

// DeleteURL godoc
// @Summary Delete a short URL
// @Description Delete a short URL (only owner can delete)
// @Tags shortener
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param request body dto.DeleteRequest true "Short code to delete"
// @Success 200 {string} string
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /delete [post]
// @Security BearerAuth
func DeleteURL(w http.ResponseWriter, r *http.Request) {

	ctxUserID := r.Context().Value("userID")
	if ctxUserID == nil {
		HandleError(w, http.StatusUnauthorized, "Token không hợp lệ (ctx rỗng)")
		return
	}

	userID, ok := ctxUserID.(int)
	if !ok || userID == 0 {
		HandleError(w, http.StatusUnauthorized, "Token không hợp lệ (ctx sai kiểu)")
		return
	}

	var req dto.DeleteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		HandleError(w, http.StatusBadRequest, "Invalid body")
		return
	}

	if req.Code == "" {
		HandleError(w, http.StatusBadRequest, "Missing code")
		return
	}

	ok, msg := shortener.Delete(req.Code, userID)
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

// GetAllLinks godoc
// @Summary Get all user's links
// @Description Get paginated list of user's short URLs
// @Tags shortener
// @Produce json
// @Param Authorization header string true "Bearer token"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /links [get]
// @Security BearerAuth
func GetAllLinks(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		HandleError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// (Middleware đã chạy và đính userID vào đây)
	ctxUserID := r.Context().Value("userID")
	if ctxUserID == nil {
		// Nếu không có token, đây là "khách" -> Chặn
		HandleError(w, http.StatusUnauthorized, "Bạn phải đăng nhập để xem link")
		return
	}

	userID, ok := ctxUserID.(int)
	if !ok || userID == 0 {
		HandleError(w, http.StatusUnauthorized, "Token không hợp lệ")
		return
	}

	q := r.URL.Query()
	pageStr := q.Get("page")
	limitStr := q.Get("limit")

	page, _ := strconv.Atoi(pageStr)
	limit, _ := strconv.Atoi(limitStr)

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	offset := (page - 1) * limit

	// (Truyền userID vào)
	links, err := shortener.GetAllPaginatedByUser(userID, limit, offset)

	if err != nil {
		HandleError(w, http.StatusInternalServerError, "Không thể truy vấn dữ liệu")
		return
	}

	response := map[string]interface{}{
		"page":  page,
		"limit": limit,
		"data":  links,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		HandleError(w, http.StatusInternalServerError, "Failed to write response")
	}
}

func SearchLinksHandler(w http.ResponseWriter, r *http.Request) {

	query := r.URL.Query()
	q := query.Get("q")
	pageStr := query.Get("page")

	if q == "" {
		http.Error(w, "Tham số 'q' là bắt buộc", http.StatusBadRequest)
		return
	}

	page, err := strconv.Atoi(pageStr)
	if err != nil || page < 1 {
		page = 1
	}

	limit := 5
	offset := (page - 1) * limit
	links, total, err := shortener.SearchLinks(q, limit, offset)

	if err != nil {
		http.Error(w, "Lỗi Server: "+err.Error(), http.StatusInternalServerError)
		return
	}

	lastPage := int(math.Ceil(float64(total) / float64(limit)))
	if lastPage < 1 && total == 0 {
		lastPage = 1
	}

	resp := map[string]interface{}{
		"data":      links,
		"total":     total,
		"page":      page,
		"last_page": lastPage,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
