package main

import (
	"log"
	"myproject/handler"
	"myproject/middleware"
	"myproject/shortener"
	"net/http"
)

func main() {

	url1 := shortener.Shorten("https://golang.org", 1)
	url2 := shortener.Shorten("https://example.com", 2)
	log.Println("First URL code:", url1.ShortCode)
	log.Println("Second URL code:", url2.ShortCode)
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

	http.Handle("/", http.HandlerFunc(handler.ResolveURL))

	port := ":8080"
	log.Println(" Server running on", port)
	log.Fatal(http.ListenAndServe(port, nil))

}
