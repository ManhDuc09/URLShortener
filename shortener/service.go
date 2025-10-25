package shortener

import (
	"math/rand"
	"myproject/models"
)

var (
	urlStore = map[string]models.ShortURL{}
	nextID   = 1
	charset  = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
)

func generateCode(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func Shorten(url string, userID int) models.ShortURL {
	code := generateCode(6)

	for {
		if _, exists := urlStore[code]; !exists {
			break
		}
		code = generateCode(6)
	}

	shortURL := models.ShortURL{
		ID:          nextID,
		OriginalURL: url,
		ShortCode:   code,
		UserID:      userID,
		Clicks:      0,
	}

	urlStore[code] = shortURL
	nextID++

	return shortURL
}

func Resolve(code string) (*models.ShortURL, bool) {
	if u, ok := urlStore[code]; ok {
		u.Clicks++
		urlStore[code] = u
		return &u, true
	}
	return nil, false
}

func Delete(code string, userID int) (bool, string) {
	u, ok := urlStore[code]
	if !ok {
		return false, "Code not found"
	}

	if u.UserID != userID {
		return false, "Forbidden: user does not own this URL"
	}

	delete(urlStore, code)
	return true, "Deleted successfully"
}

func GetAll() []models.ShortURL {
	result := []models.ShortURL{}
	for _, u := range urlStore {
		result = append(result, u)
	}
	return result
}

func FindByID(id int) (*models.ShortURL, bool) {
	for _, u := range urlStore {
		if u.ID == id {
			return &u, true
		}
	}
	return nil, false
}
