package repository

import (
	"database/sql"
	"errors"
	"webshop-backend/internal/models"
)

type CartRepository struct {
	db *sql.DB
}

func NewCartRepository(db *sql.DB) *CartRepository {
	return &CartRepository{db: db}
}

var ErrInsufficientStock = errors.New("insufficient stock")

// getOrCreateCart returns the cart id for a user, creating one if it doesn't exist.
func (r *CartRepository) getOrCreateCart(tx *sql.Tx, userID int) (int, error) {
	var cartID int
	err := tx.QueryRow(`SELECT id FROM cart WHERE user_id = $1`, userID).Scan(&cartID)
	if err == sql.ErrNoRows {
		err = tx.QueryRow(
			`INSERT INTO cart (user_id) VALUES ($1) RETURNING id`, userID,
		).Scan(&cartID)
	}
	return cartID, err
}

// List returns all cart items for a user, joined with product info.
func (r *CartRepository) List(userID int) ([]models.CartItem, error) {
	const q = `
		SELECT ci.id, ci.cart_id, ci.product_id, p.name, p.price,
		       ci.quantity, p.price * ci.quantity AS subtotal, ci.added_at
		FROM   cart_items ci
		JOIN   cart      c  ON c.id  = ci.cart_id
		JOIN   products  p  ON p.id  = ci.product_id
		WHERE  c.user_id = $1
		ORDER  BY ci.added_at`

	rows, err := r.db.Query(q, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []models.CartItem
	for rows.Next() {
		var ci models.CartItem
		if err := rows.Scan(
			&ci.ID, &ci.CartID, &ci.ProductID, &ci.ProductName,
			&ci.UnitPrice, &ci.Quantity, &ci.Subtotal, &ci.AddedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, ci)
	}
	return items, rows.Err()
}

// Add inserts a new cart row or increments quantity if the product is already in the cart.
func (r *CartRepository) Add(userID, productID, qty int) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var stock, existing int
	err = tx.QueryRow(`SELECT stock FROM products WHERE id = $1`, productID).Scan(&stock)
	if err == sql.ErrNoRows {
		return errors.New("product not found")
	}
	if err != nil {
		return err
	}

	cartID, err := r.getOrCreateCart(tx, userID)
	if err != nil {
		return err
	}

	_ = tx.QueryRow(
		`SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
		cartID, productID,
	).Scan(&existing)

	if existing+qty > stock {
		return ErrInsufficientStock
	}

	const upsert = `
		INSERT INTO cart_items (cart_id, product_id, quantity)
		VALUES ($1, $2, $3)
		ON CONFLICT (cart_id, product_id)
		DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`
	if _, err := tx.Exec(upsert, cartID, productID, qty); err != nil {
		return err
	}
	return tx.Commit()
}

// UpdateQuantity sets the absolute quantity for a cart row.
// Returns (false, nil) when the row does not exist.
func (r *CartRepository) UpdateQuantity(userID, productID, qty int) (bool, error) {
	var stock int
	err := r.db.QueryRow(`SELECT stock FROM products WHERE id = $1`, productID).Scan(&stock)
	if err == sql.ErrNoRows {
		return false, errors.New("product not found")
	}
	if err != nil {
		return false, err
	}
	if qty > stock {
		return false, ErrInsufficientStock
	}

	const q = `
		UPDATE cart_items ci
		SET    quantity = $1
		FROM   cart c
		WHERE  ci.cart_id = c.id
		  AND  c.user_id  = $2
		  AND  ci.product_id = $3`
	res, err := r.db.Exec(q, qty, userID, productID)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}

// Remove deletes one product from the user's cart.
func (r *CartRepository) Remove(userID, productID int) (bool, error) {
	const q = `
		DELETE FROM cart_items ci
		USING  cart c
		WHERE  ci.cart_id    = c.id
		  AND  c.user_id     = $1
		  AND  ci.product_id = $2`
	res, err := r.db.Exec(q, userID, productID)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}

// Clear empties the user's cart (called after order placement).
func (r *CartRepository) Clear(userID int) error {
	_, err := r.db.Exec(`
		DELETE FROM cart_items ci
		USING  cart c
		WHERE  ci.cart_id = c.id AND c.user_id = $1`, userID)
	return err
}

// GetCartID returns the cart id for a user, or 0 if no cart exists.
func (r *CartRepository) GetCartID(userID int) (int, error) {
	var cartID int
	err := r.db.QueryRow(`SELECT id FROM cart WHERE user_id = $1`, userID).Scan(&cartID)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return cartID, err
}
