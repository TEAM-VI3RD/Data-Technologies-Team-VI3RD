package repository

import (
	"database/sql"
	"webshop-backend/internal/models"
)

type AddressRepository struct {
	db *sql.DB
}

func NewAddressRepository(db *sql.DB) *AddressRepository {
	return &AddressRepository{db: db}
}

// ListForUser returns all addresses belonging to a user.
func (r *AddressRepository) ListForUser(userID int) ([]models.Address, error) {
	const q = `
		SELECT id, user_id, type, full_name, street, house_number, postal_code, city, country
		FROM   addresses
		WHERE  user_id = $1
		ORDER  BY id`

	rows, err := r.db.Query(q, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var addrs []models.Address
	for rows.Next() {
		var a models.Address
		if err := rows.Scan(
			&a.ID, &a.UserID, &a.Type, &a.FullName, &a.Street,
			&a.HouseNumber, &a.PostalCode, &a.City, &a.Country,
		); err != nil {
			return nil, err
		}
		addrs = append(addrs, a)
	}
	return addrs, rows.Err()
}

// GetByID returns (nil, nil) when the address does not exist.
func (r *AddressRepository) GetByID(id, userID int) (*models.Address, error) {
	const q = `
		SELECT id, user_id, type, full_name, street, house_number, postal_code, city, country
		FROM   addresses
		WHERE  id = $1 AND user_id = $2`

	var a models.Address
	err := r.db.QueryRow(q, id, userID).Scan(
		&a.ID, &a.UserID, &a.Type, &a.FullName, &a.Street,
		&a.HouseNumber, &a.PostalCode, &a.City, &a.Country,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// Create inserts a new address and returns the full row.
func (r *AddressRepository) Create(userID int, req models.CreateAddressRequest) (*models.Address, error) {
	const q = `
		INSERT INTO addresses (user_id, type, full_name, street, house_number, postal_code, city, country)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, user_id, type, full_name, street, house_number, postal_code, city, country`

	var a models.Address
	err := r.db.QueryRow(q,
		userID, req.Type, req.FullName, req.Street,
		req.HouseNumber, req.PostalCode, req.City, req.Country,
	).Scan(
		&a.ID, &a.UserID, &a.Type, &a.FullName, &a.Street,
		&a.HouseNumber, &a.PostalCode, &a.City, &a.Country,
	)
	if err != nil {
		return nil, err
	}
	return &a, nil
}

// Delete removes an address. Only the owning user can delete.
// Returns (false, nil) when no row matched.
func (r *AddressRepository) Delete(id, userID int) (bool, error) {
	res, err := r.db.Exec(`DELETE FROM addresses WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}
