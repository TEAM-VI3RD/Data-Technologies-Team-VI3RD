package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	// pgx registers itself as a "pgx" driver for database/sql.
	// The blank import is the standard pattern for side-effect-only imports.
	_ "github.com/jackc/pgx/v5/stdlib"
)

// DB is the shared connection pool used by all repositories.
// It is safe for concurrent use — sql.DB manages the pool internally.
var DB *sql.DB

// Connect reads env vars, opens the PostgreSQL connection pool, and verifies
// reachability with Ping. The app exits if the connection cannot be established.
func Connect() {
	// godotenv.Load is a no-op when .env is absent (e.g. inside Docker where
	// variables come from docker-compose env_file). We log but do not fatal.
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found — using environment variables from OS/Docker")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	name := os.Getenv("DB_NAME")

	if host == "" || port == "" || user == "" || name == "" {
		log.Fatal("Missing required DB env vars: DB_HOST, DB_PORT, DB_USER, DB_NAME")
	}

	// PostgreSQL DSN (keyword=value format — pgx stdlib accepts both this and
	// the postgres:// URL form).
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, name,
	)

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("sql.Open failed: %v", err)
	}

	// Ping verifies the DSN is valid AND the server is reachable.
	// Without this, Open() succeeds even with a wrong host — it is lazy.
	if err := db.Ping(); err != nil {
		log.Fatalf("Cannot reach PostgreSQL at %s:%s — %v", host, port, err)
	}

	DB = db
	log.Printf("PostgreSQL connected (host=%s port=%s db=%s)", host, port, name)
}
