package repository

import (
	"database/sql"
	"errors"
	"webshop-backend/internal/models"
)

type ReturnRepository struct {
	db *sql.DB
}

func NewReturnRepository(db *sql.DB) *ReturnRepository {
	return &ReturnRepository{db: db}
}

var ErrOrderNotOwned = errors.New("order not found or not owned by user")

// Create submits a return request for an order owned by the user.
func (r *ReturnRepository) Create(userID int, req models.CreateReturnRequest) (*models.Return, error) {
	// Verify the order belongs to this user.
	var ownerID int
	err := r.db.QueryRow(`SELECT user_id FROM orders WHERE id = $1`, req.OrderID).Scan(&ownerID)
	if err == sql.ErrNoRows || ownerID != userID {
		return nil, ErrOrderNotOwned
	}
	if err != nil {
		return nil, err
	}

	const q = `
		INSERT INTO returns (order_id, user_id, reason)
		VALUES ($1, $2, $3)
		RETURNING id, order_id, user_id, reason, status, requested_at, resolved_at`

	var ret models.Return
	err = r.db.QueryRow(q, req.OrderID, userID, req.Reason).Scan(
		&ret.ID, &ret.OrderID, &ret.UserID, &ret.Reason,
		&ret.Status, &ret.RequestedAt, &ret.ResolvedAt,
	)
	if err != nil {
		return nil, err
	}
	return &ret, nil
}

// ListForUser returns all return requests submitted by a user.
func (r *ReturnRepository) ListForUser(userID int) ([]models.Return, error) {
	const q = `
		SELECT id, order_id, user_id, reason, status, requested_at, resolved_at
		FROM   returns
		WHERE  user_id = $1
		ORDER  BY requested_at DESC`
	return r.scan(q, userID)
}

// ListAll returns every return request (admin).
func (r *ReturnRepository) ListAll() ([]models.Return, error) {
	const q = `
		SELECT id, order_id, user_id, reason, status, requested_at, resolved_at
		FROM   returns
		ORDER  BY requested_at DESC`
	return r.scan(q)
}

// UpdateStatus changes the status of a return (admin only).
// Returns (false, nil) when no row matched.
func (r *ReturnRepository) UpdateStatus(id int, status string) (bool, error) {
	var q string
	if status == "completed" || status == "rejected" {
		q = `UPDATE returns SET status = $1, resolved_at = NOW() WHERE id = $2`
	} else {
		q = `UPDATE returns SET status = $1 WHERE id = $2`
	}
	res, err := r.db.Exec(q, status, id)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}

func (r *ReturnRepository) scan(q string, args ...any) ([]models.Return, error) {
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var returns []models.Return
	for rows.Next() {
		var ret models.Return
		if err := rows.Scan(
			&ret.ID, &ret.OrderID, &ret.UserID, &ret.Reason,
			&ret.Status, &ret.RequestedAt, &ret.ResolvedAt,
		); err != nil {
			return nil, err
		}
		returns = append(returns, ret)
	}
	return returns, rows.Err()
}
