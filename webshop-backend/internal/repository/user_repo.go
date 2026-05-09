package repository

import (
	"database/sql"
	"webshop-backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(email, fullName, passwordHash string) (*models.User, error) {
	const q = `
		INSERT INTO users (email, full_name, password_hash)
		VALUES ($1, $2, $3)
		RETURNING id, email, full_name, created_at`

	var u models.User
	err := r.db.QueryRow(q, email, fullName, passwordHash).Scan(
		&u.ID, &u.Email, &u.FullName, &u.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// GetByEmail returns the user including password_hash for login verification.
// Returns (nil, nil) when no user with that email exists.
func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	const q = `
		SELECT id, email, full_name, password_hash, created_at
		FROM   users
		WHERE  email = $1`

	var u models.User
	err := r.db.QueryRow(q, email).Scan(
		&u.ID, &u.Email, &u.FullName, &u.PasswordHash, &u.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
