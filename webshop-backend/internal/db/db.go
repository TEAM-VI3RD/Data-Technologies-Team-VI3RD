package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func Connect() {
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

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
	fmt.Println("Database connected successfully")
}
