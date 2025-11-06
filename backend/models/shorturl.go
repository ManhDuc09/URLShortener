package models

type ShortURL struct {
	ID          uint   `gorm:"primaryKey;autoIncrement"`
	OriginalURL string `gorm:"not null"`
	ShortCode   string `gorm:"uniqueIndex;not null"`
	UserID      *int   `gorm:"index;default:NULL"` // Allow NULL for non-logged-in users
	Clicks      int
}
