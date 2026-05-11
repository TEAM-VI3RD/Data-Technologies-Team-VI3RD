package repository

import (
	"database/sql"
	"errors"
	"webshop-backend/internal/models"
)

type OrderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

// ErrEmptyCart is returned when a user tries to place an order with no cart items.
var ErrEmptyCart = errors.New("cart is empty")

// PlaceOrder turns the user's cart into an order atomically:
//
//   - Locks the product rows (FOR UPDATE) to prevent oversell under concurrency.
//   - Verifies stock for every line.
//   - Snapshots the unit_price into order_items (preserves history).
//   - Decrements product stock.
//   - Clears the cart.
//
// Returns the new order id.
func (r *OrderRepository) PlaceOrder(userID int) (int, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return 0, err
	}
	defer tx.Rollback()

	// Lock products referenced by the cart, in id order to avoid deadlocks.
	const lockQ = `
		SELECT p.id, p.price, p.stock, ci.quantity
		FROM   cart_items ci
		JOIN   products   p ON p.id = ci.product_id
		WHERE  ci.user_id = $1
		ORDER  BY p.id
		FOR    UPDATE OF p`

	rows, err := tx.Query(lockQ, userID)
	if err != nil {
		return 0, err
	}

	type line struct {
		productID, stock, qty int
		price                 float64
	}
	var lines []line
	for rows.Next() {
		var l line
		if err := rows.Scan(&l.productID, &l.price, &l.stock, &l.qty); err != nil {
			rows.Close()
			return 0, err
		}
		lines = append(lines, l)
	}
	rows.Close()
	if err := rows.Err(); err != nil {
		return 0, err
	}
	if len(lines) == 0 {
		return 0, ErrEmptyCart
	}

	for _, l := range lines {
		if l.qty > l.stock {
			return 0, ErrInsufficientStock
		}
	}

	var orderID int
	err = tx.QueryRow(
		`INSERT INTO orders (user_id) VALUES ($1) RETURNING id`, userID,
	).Scan(&orderID)
	if err != nil {
		return 0, err
	}

	const insertItem = `
		INSERT INTO order_items (order_id, product_id, quantity, unit_price)
		VALUES ($1, $2, $3, $4)`
	const decStock = `UPDATE products SET stock = stock - $1 WHERE id = $2`

	for _, l := range lines {
		if _, err := tx.Exec(insertItem, orderID, l.productID, l.qty, l.price); err != nil {
			return 0, err
		}
		if _, err := tx.Exec(decStock, l.qty, l.productID); err != nil {
			return 0, err
		}
	}

	if _, err := tx.Exec(`DELETE FROM cart_items WHERE user_id = $1`, userID); err != nil {
		return 0, err
	}

	if err := tx.Commit(); err != nil {
		return 0, err
	}
	return orderID, nil
}

// ListForUser returns the user's own orders, newest first, with totals.
func (r *OrderRepository) ListForUser(userID int) ([]models.Order, error) {
	const q = `
		SELECT o.id, o.user_id, o.status, o.created_at,
		       COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
		FROM   orders o
		LEFT   JOIN order_items oi ON oi.order_id = o.id
		WHERE  o.user_id = $1
		GROUP  BY o.id
		ORDER  BY o.created_at DESC`
	return r.scanOrders(q, userID)
}

// ListAll returns every order in the system (admin).
func (r *OrderRepository) ListAll() ([]models.Order, error) {
	const q = `
		SELECT o.id, o.user_id, o.status, o.created_at,
		       COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
		FROM   orders o
		LEFT   JOIN order_items oi ON oi.order_id = o.id
		GROUP  BY o.id
		ORDER  BY o.created_at DESC`
	return r.scanOrders(q)
}

// GetByID returns an order with its items. ownerID > 0 enforces ownership.
func (r *OrderRepository) GetByID(orderID, ownerID int) (*models.Order, error) {
	var o models.Order
	var args []any
	q := `
		SELECT o.id, o.user_id, o.status, o.created_at,
		       COALESCE(SUM(oi.quantity * oi.unit_price), 0) AS total
		FROM   orders o
		LEFT   JOIN order_items oi ON oi.order_id = o.id
		WHERE  o.id = $1`
	args = append(args, orderID)
	if ownerID > 0 {
		q += ` AND o.user_id = $2`
		args = append(args, ownerID)
	}
	q += ` GROUP BY o.id`

	err := r.db.QueryRow(q, args...).Scan(&o.ID, &o.UserID, &o.Status, &o.CreatedAt, &o.Total)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	const itemsQ = `
		SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.unit_price,
		       oi.quantity * oi.unit_price AS subtotal
		FROM   order_items oi
		JOIN   products    p ON p.id = oi.product_id
		WHERE  oi.order_id = $1`
	rows, err := r.db.Query(itemsQ, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	for rows.Next() {
		var it models.OrderItem
		if err := rows.Scan(&it.ID, &it.ProductID, &it.ProductName,
			&it.Quantity, &it.UnitPrice, &it.Subtotal); err != nil {
			return nil, err
		}
		o.Items = append(o.Items, it)
	}
	return &o, rows.Err()
}

// UpdateStatus changes the status of an order (admin only).
// Returns (false, nil) when no row matched.
func (r *OrderRepository) UpdateStatus(orderID int, status string) (bool, error) {
	res, err := r.db.Exec(
		`UPDATE orders SET status = $1 WHERE id = $2`, status, orderID,
	)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}

// scanOrders runs an "order list" query (5 columns) and returns the slice.
func (r *OrderRepository) scanOrders(q string, args ...any) ([]models.Order, error) {
	rows, err := r.db.Query(q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(&o.ID, &o.UserID, &o.Status, &o.CreatedAt, &o.Total); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	return orders, rows.Err()
}
