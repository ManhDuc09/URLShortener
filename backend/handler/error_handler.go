package handler

import (
	"encoding/json"
	"log"
	"net/http"
)

// HandleError - Chuẩn hóa phản hồi lỗi dưới dạng JSON
func HandleError(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status) // Gán mã HTTP status (vd: 400, 500)

	// Log lỗi chi tiết để hỗ trợ debug
	log.Printf("Error: %s, Status: %d", message, status)

	// Chuẩn bị phản hồi JSON
	response := map[string]any{
		"error":   true,
		"message": message,
	}

	// Mã hóa phản hồi JSON và xử lý lỗi nếu có
	if err := json.NewEncoder(w).Encode(response); err != nil {
		log.Printf("Failed to encode error response: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("{\"error\":true,\"message\":\"Internal Server Error\"}"))
	}
}
