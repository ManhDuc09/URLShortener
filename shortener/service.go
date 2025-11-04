package shortener

import (
	"math/rand"
	"myproject/database"
	"myproject/models"
	"time"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func generateCode(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func Shorten(url string, userID int) models.ShortURL {
	code := generateCode(6)
	var existing models.ShortURL

	for {
		result := database.DB.First(&existing, "short_code = ?", code)
		if result.RowsAffected == 0 {
			break
		}
		code = generateCode(6)
	}

	shortURL := models.ShortURL{
		OriginalURL: url,
		ShortCode:   code,
		UserID:      userID,
		Clicks:      0,
	}

	database.DB.Create(&shortURL)

	return shortURL
}

func init() {
	rand.Seed(time.Now().UnixNano())
}
func Resolve(code string) (*models.ShortURL, bool) {
	var link models.ShortURL
	result := database.DB.First(&link, "short_code = ?", code)
	if result.RowsAffected == 0 {
		return nil, false
	}

	link.Clicks++
	database.DB.Save(&link)

	return &link, true
}

func Delete(code string, userID int) (bool, string) {
	var link models.ShortURL
	result := database.DB.First(&link, "short_code = ?", code)
	if result.RowsAffected == 0 {
		return false, "Code not found"
	}

	if link.UserID != userID {
		return false, "Forbidden: user does not own this URL"
	}

	database.DB.Delete(&link)
	return true, "Deleted successfully"
}

func GetAll() []models.ShortURL {
	var links []models.ShortURL
	database.DB.Find(&links)
	return links
}

func FindByID(id uint) (*models.ShortURL, bool) {
	var link models.ShortURL
	result := database.DB.First(&link, id)
	if result.RowsAffected == 0 {
		return nil, false
	}
	return &link, true
}
