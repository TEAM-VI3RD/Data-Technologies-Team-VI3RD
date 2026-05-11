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

func (r *UserRepository) Create(email, passwordHash string) (*models.User, error) {
	const q = `
		INSERT INTO users (email, password_hash)
		VALUES ($1, $2)
		RETURNING id, email, is_admin, blocked, created_at`

	var u models.User
	err := r.db.QueryRow(q, email, passwordHash).Scan(
		&u.ID, &u.Email, &u.IsAdmin, &u.Blocked, &u.CreatedAt,
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
		SELECT id, email, password_hash, is_admin, blocked, created_at
		FROM   users
		WHERE  email = $1`

	var u models.User
	err := r.db.QueryRow(q, email).Scan(
		&u.ID, &u.Email, &u.PasswordHash, &u.IsAdmin, &u.Blocked, &u.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepository) GetAll() ([]models.User, error) {
	const q = `
		SELECT id, email, is_admin, blocked, created_at
		FROM   users
		ORDER  BY id ASC`

	rows, err := r.db.Query(q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(
			&u.ID, &u.Email, &u.IsAdmin, &u.Blocked, &u.CreatedAt,
		); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, rows.Err()
}

// GetByID returns (nil, nil) when the user does not exist.
func (r *UserRepository) GetByID(id int) (*models.User, error) {
	const q = `
		SELECT id, email, is_admin, blocked, created_at
		FROM   users
		WHERE  id = $1`

	var u models.User
	err := r.db.QueryRow(q, id).Scan(
		&u.ID, &u.Email, &u.IsAdmin, &u.Blocked, &u.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// SetBlocked updates the blocked status and returns the updated user.
// Returns (nil, nil) when the user does not exist.
func (r *UserRepository) SetBlocked(id int, blocked bool) (*models.User, error) {
	const q = `
		UPDATE users
		SET    blocked = $1
		WHERE  id = $2
		RETURNING id, email, is_admin, blocked, created_at`

	var u models.User
	err := r.db.QueryRow(q, blocked, id).Scan(
		&u.ID, &u.Email, &u.IsAdmin, &u.Blocked, &u.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}

// Delete removes a user by id. Returns (false, nil) when no row matched.
func (r *UserRepository) Delete(id int) (bool, error) {
	result, err := r.db.Exec(`DELETE FROM users WHERE id = $1`, id)
	if err != nil {
		return false, err
	}
	n, _ := result.RowsAffected()
	return n > 0, nil
}
