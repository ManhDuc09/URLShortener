package main

import (
	"log"
	"myproject/handler"
	"net/http"
)

func main() {

	http.HandleFunc("/shorten", handler.ShortenURL)
	http.HandleFunc("/", handler.ResolveURL)

	port := ":8080"
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatal(err)
	}
}
