package database

import (
	"fmt"
	"log"
	"myproject/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	dsn := "host=localhost user=postgres password=admin dbname=urlshortener port=5432 sslmode=disable"

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf(" Failed to connect to database: %v", err)
	}

	err = db.AutoMigrate(
		&models.ShortURL{},
	)
	if err != nil {
		log.Fatalf(" Failed to migrate database: %v", err)
	}

	DB = db
	fmt.Println(" Connected to PostgreSQL and auto-migrated successfully.")
}
