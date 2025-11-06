package middleware

import (
	"context"
	"net/http"
	"strings"

	"myproject/handler" // Đảm bảo đường dẫn này đúng

	"log"

	"github.com/golang-jwt/jwt/v5"
)

var jwtKey = []byte("my_secret_key")

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			next.ServeHTTP(w, r)
			return
		}

		// --- Nếu có header, chúng ta MỚI tiến hành xác thực ---
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			handler.HandleError(w, http.StatusUnauthorized, "Token is invalid or expired")
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			handler.HandleError(w, http.StatusUnauthorized, "Invalid token claims")
			return
		}

		userID, ok := claims["user_id"].(float64)
		if !ok {
			handler.HandleError(w, http.StatusUnauthorized, "Invalid user_id in token")
			return
		}

		log.Printf("Middleware extracted userID: %d", int(userID))

		// Thiết lập userID vào Context cho handler
		ctx := context.WithValue(r.Context(), "userID", int(userID))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
