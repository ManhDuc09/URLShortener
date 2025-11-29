package shortener

import (
	"errors"
	"math/rand"
	"myproject/database"
	"myproject/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var jwtKey = []byte("my_secret_key")

func generateCode(length int) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func Shorten(url string, userID *int) models.ShortURL {
	code := generateCode(6)
	var existing models.ShortURL

	for {
		// Check if the short_code exists without logging an error
		result := database.DB.First(&existing, "short_code = ?", code)
		if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		}
		if result.RowsAffected == 0 {
			break
		}
		code = generateCode(6)
	}

	// Ensure userID is nil if it's 0
	var finalUserID *int
	if userID != nil && *userID != 0 {
		finalUserID = userID
	}

	shortURL := models.ShortURL{
		OriginalURL: url,
		ShortCode:   code,
		UserID:      finalUserID, // Use finalUserID which can be nil
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
		var record models.ShortURL
		if err := database.DB.First(&record, id).Error; err == nil {
			record.Clicks++
			database.DB.Save(&record)
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

	if link.UserID != nil && *link.UserID != userID {
		return false, "Forbidden: user does not own this URL"
	}

	database.DB.Delete(&link)
	return true, "Deleted successfully"
}

func GetAllPaginatedByUser(userID int, limit int, offset int) ([]models.ShortURL, error) {
	var links []models.ShortURL

	// Thêm .Where("user_id = ?", userID) để lọc theo người dùng
	result := database.DB.Where("user_id = ?", userID).Limit(limit).Offset(offset).Find(&links)

	if result.Error != nil {
		return nil, result.Error
	}

	return links, nil
}

func FindByID(id uint) (*models.ShortURL, bool) {
	var link models.ShortURL
	result := database.DB.First(&link, id)
	if result.RowsAffected == 0 {
		return nil, false
	}
	return &link, true
}

func RegisterUser(name, email, password string) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("failed to hash password")
	}

	user := &models.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hashedPassword),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	result := database.DB.Create(user)
	if result.Error != nil {
		return nil, errors.New("failed to create user")
	}

	return user, nil
}

func AuthenticateUser(email, password string) (string, string, error) {
	var user models.User
	result := database.DB.Where("email = ?", email).First(&user)
	if result.Error != nil {
		return "", "", errors.New("user not found")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", "", errors.New("invalid credentials")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	})
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		return "", "", errors.New("failed to generate token")
	}

	return tokenString, user.Name, nil
}

func SearchLinks(q string, limit int, offset int) ([]models.ShortURL, int64, error) {
	var links []models.ShortURL
	var total int64

	searchCondition := "%" + q + "%"

	err := database.DB.Model(&models.ShortURL{}).Where("original_url LIKE ?", searchCondition).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	result := database.DB.Where("original_url LIKE ?", searchCondition).Limit(limit).Offset(offset).Find(&links)

	if result.Error != nil {
		return nil, 0, result.Error
	}

	return links, total, nil
}
