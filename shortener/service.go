package shortener

import (
	"log"
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

func UpdateClicksAsync(id uint) {
	go func(id uint) {
		log.Printf("[Goroutine] Updating click count for ID %d...", id)

		var record models.ShortURL
		if err := database.DB.First(&record, id).Error; err == nil {
			record.Clicks++
			database.DB.Save(&record)
			log.Printf("[Goroutine] Updated clicks for ID %d", id)
		} else {
			log.Printf("[Goroutine] Failed to update clicks for ID %d: %v", id, err)
		}
	}(id)
}
func Resolve(code string) (*models.ShortURL, bool) {
	var link models.ShortURL
	result := database.DB.First(&link, "short_code = ?", code)
	if result.RowsAffected == 0 {
		return nil, false
	}

	UpdateClicksAsync(link.ID)

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
