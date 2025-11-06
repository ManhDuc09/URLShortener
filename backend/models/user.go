package models

import "time"

type User struct {
	ID           uint   `gorm:"primaryKey;autoIncrement"`
	Name         string `gorm:"size:100"`
	Email        string `gorm:"size:100;uniqueIndex;not null"`
	PasswordHash string `gorm:"not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	ShortURLs    []ShortURL `gorm:"foreignKey:UserID" json:"short_urls,omitempty"`
}
