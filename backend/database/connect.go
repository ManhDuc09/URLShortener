package database

import (
	"fmt"
	"log"
	"myproject/models"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {

	if err := godotenv.Load(); err != nil {
		log.Println("  No .env file found — continuing with system environment variables")
	}

	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")
	sslmode := os.Getenv("DB_SSLMODE")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	err = db.AutoMigrate(&models.User{})
	if err != nil {
		log.Fatalf("Failed to migrate User model: %v", err)
	}

	err = db.AutoMigrate(&models.ShortURL{})
	if err != nil {
		log.Fatalf("Failed to migrate ShortURL model: %v", err)
	}

	// Ensure user_id in short_urls allows NULL
	db.Exec("ALTER TABLE short_urls ALTER COLUMN user_id DROP NOT NULL")

	DB = db
	fmt.Println("Connected to PostgreSQL and auto-migrated successfully.")
}
