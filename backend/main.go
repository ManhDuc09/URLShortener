package main

import (
	"log"
	"myproject/database"
	"myproject/handler"
	"myproject/middleware"
	"net/http"

	"github.com/rs/cors" // <-- 1. Import thư viện
)

func main() {

	database.Connect()

	// Cấu hình Cors
	c := cors.New(cors.Options{
		// URL của React app của bạn (Vite thường chạy ở 5173)
		AllowedOrigins: []string{"http://localhost:5173"},

		// Các method bạn cho phép
		AllowedMethods: []string{"GET", "POST", "DELETE", "OPTIONS"},

		// Các header bạn cho phép (RẤT QUAN TRỌNG VÌ BẠN DÙNG JWT)
		AllowedHeaders: []string{"Authorization", "Content-Type"},

		// Cho phép gửi cookie/credentials (nếu có)
		AllowCredentials: true,
	})

	http.Handle("/shorten-public",
		http.HandlerFunc(handler.ShortenURL),
	)

	http.Handle("/shorten",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware(
				http.HandlerFunc(handler.ShortenURL),
			),
		),
	)

	http.Handle("/links",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware( // Bạn nên bọc Auth để chỉ chủ nhân thấy
				http.HandlerFunc(handler.GetAllLinks),
			),
		),
	)

	http.Handle("/delete",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware(
				http.HandlerFunc(handler.DeleteURL),
			),
		),
	)
	http.Handle("/",
		middleware.LoggingMiddleware(
			http.HandlerFunc(handler.ResolveURL),
		),
	)

	http.Handle("/register",
		http.HandlerFunc(handler.Register),
	)
	http.Handle("/login",
		http.HandlerFunc(handler.Login),
	)

	// "Bọc" router mặc định (DefaultServeMux) bằng CORS ===
	// Biến `handler` này sẽ chứa middleware CORS,
	// và middleware CORS sẽ gọi router mặc định của bạn (nơi chứa các Handle ở trên)
	handler := c.Handler(http.DefaultServeMux)

	port := ":8080"
	log.Println(" Server running on", port)

	// === 5. Khởi chạy server với handler đã được bọc CORS ===
	log.Fatal(http.ListenAndServe(port, handler)) // <-- Sửa nil thành handler
}
