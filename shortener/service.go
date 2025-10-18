package shortener

import (
	"math/rand"
)

var urlStore = map[string]string{
	"abc123": "https://golang.org",
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func Shorten(url string) string {
	code := generateCode(6)
	_, exists := urlStore[code]
	for exists {
		code = generateCode(6)
		_, exists = urlStore[code]
	}
	urlStore[code] = url
	return code
}

func Resolve(code string) string {
	if url, ok := urlStore[code]; ok {
		return url
	}
	return ""
}

func generateCode(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
