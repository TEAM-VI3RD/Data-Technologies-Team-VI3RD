package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
)

var DB *sql.DB

func Connect() {
	// Get the absolute path to the .env file
	envPath := filepath.Join(".", ".env")

	// Load .env file
	if err := godotenv.Load(envPath); err != nil {
		log.Printf("Warning: Could not load .env file from %s: %v", envPath, err)
		log.Println("Using environment variables from system/Docker")
	} else {
		log.Println(".env file loaded successfully")
	}

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

	// Debug output
	log.Printf("DB Config - Host: '%s', Port: '%s', User: '%s', Name: '%s'", host, port, user, name)

	// Validate required variables
	if user == "" || host == "" || port == "" || name == "" {
		log.Fatal("Missing required database environment variables (DB_USER, DB_HOST, DB_PORT, DB_NAME)")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", user, password, host, port, name)

	database, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Cannot open database: %v", err)
	}

	// Ping om verbinding te checken
	if err := database.Ping(); err != nil {
		log.Fatalf("Cannot connect to database: %v", err)
	}

	DB = database
	log.Println("Database connected successfully")
}
