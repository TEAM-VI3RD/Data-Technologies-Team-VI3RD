package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

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
	loadEnvFile(".env")

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

func loadEnvFile(fileName string) {
	wd, err := os.Getwd()
	if err != nil {
		log.Printf("Unable to determine working directory: %v", err)
		return
	}

	if path := findEnvFile(wd, fileName); path != "" {
		if err := godotenv.Load(path); err != nil {
			log.Printf("Failed to load %s: %v", path, err)
		}
		return
	}

	log.Printf("No %s file found — using environment variables from OS/Docker", fileName)
}

func findEnvFile(startDir, fileName string) string {
	currentDir := startDir
	for {
		candidate := filepath.Join(currentDir, fileName)
		if info, err := os.Stat(candidate); err == nil && !info.IsDir() {
			return candidate
		}

		parentDir := filepath.Dir(currentDir)
		if parentDir == currentDir {
			return ""
		}
		currentDir = parentDir
	}
}
