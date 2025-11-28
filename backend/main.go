// @title URL Shortener API
// @version 1.0
// @description API documentation cho URL Shortener service
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
// @description Type "Bearer" followed by a space and JWT token.

package main

import (
	"log"
	"myproject/database"
	"myproject/handler"
	"myproject/middleware"
	"net/http"
	"os"

	_ "myproject/docs" // Swagger docs

	"github.com/rs/cors"
	httpSwagger "github.com/swaggo/http-swagger"
)

func main() {
	database.Connect()

	c := cors.New(cors.Options{
		AllowedOrigins: []string{
			"http://localhost:5173",                    // local React
			"https://urlshortener-1-jboa.onrender.com", // production React
		},
		AllowedMethods:   []string{"GET", "POST", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	http.Handle("/swagger/", httpSwagger.WrapHandler)

	// Auth routes
	http.Handle("/register", http.HandlerFunc(handler.Register))
	http.Handle("/login", http.HandlerFunc(handler.Login))

	// Shortener routes
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

	srv := c.Handler(http.DefaultServeMux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println(" Server running on port:", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, srv))

}
