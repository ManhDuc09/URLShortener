package main

import (
	"log"
	"myproject/database"
	"myproject/handler"
	"myproject/middleware"
	"net/http"
)

func main() {

	database.Connect()

	http.Handle("/shorten",
		middleware.LoggingMiddleware(
			middleware.AuthMiddleware(
				http.HandlerFunc(handler.ShortenURL),
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

	port := ":8080"
	log.Println(" Server running on", port)
	log.Fatal(http.ListenAndServe(port, nil))

}
