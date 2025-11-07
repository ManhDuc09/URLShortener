package main

import (
	"log"
	"myproject/database"
	"myproject/handler"
	"myproject/middleware"
	"net/http"
	"os" // 👈 Add this import

	"github.com/rs/cors"
)

func main() {
	database.Connect()

	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173",     // local React
			"https://your-frontend.com", // production React
		},
		AllowedMethods:   []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	http.Handle("/shorten-public", http.HandlerFunc(handler.ShortenURL))
	http.Handle("/shorten", middleware.LoggingMiddleware(
		middleware.AuthMiddleware(http.HandlerFunc(handler.ShortenURL)),
	))
	http.Handle("/links", middleware.LoggingMiddleware(
		middleware.AuthMiddleware(http.HandlerFunc(handler.GetAllLinks)),
	))
	http.Handle("/delete", middleware.LoggingMiddleware(
		middleware.AuthMiddleware(http.HandlerFunc(handler.DeleteURL)),
	))
	http.Handle("/", middleware.LoggingMiddleware(http.HandlerFunc(handler.ResolveURL)))
	http.Handle("/register", http.HandlerFunc(handler.Register))
	http.Handle("/login", http.HandlerFunc(handler.Login))

	handler := c.Handler(http.DefaultServeMux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println(" Server running on port:", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}
