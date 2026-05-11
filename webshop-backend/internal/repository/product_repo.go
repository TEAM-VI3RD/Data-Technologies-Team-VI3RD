package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"webshop-backend/internal/models"
)

// ProductFilter is the search/filter input for Search.
// All fields are optional; zero values mean "no filter".
type ProductFilter struct {
	Query      string  // free-text match on name/description
	CategoryID int     // 0 = any
	MinPrice   float64 // 0 = no lower bound
	MaxPrice   float64 // 0 = no upper bound
	Sort       string  // "new" (default), "price_asc", "price_desc", "popularity"
	Limit      int     // 0 = no limit
	Offset     int
}

// ProductRepository executes raw SQL against the products table.
// It receives a *sql.DB via the constructor — never creates its own connection.
type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// GetAll returns every product ordered newest-first.
func (r *ProductRepository) GetAll() ([]models.Product, error) {
	const q = `
		SELECT id, category_id, name, description, price, stock, created_at
		FROM   products
		ORDER  BY created_at DESC`

	rows, err := r.db.Query(q)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(
			&p.ID, &p.CategoryID, &p.Name, &p.Description,
			&p.Price, &p.Stock, &p.CreatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	// rows.Err() catches any error that occurred during iteration.
	return products, rows.Err()
}

// Search returns products matching the given filter.
// SQL is composed from whitelisted fragments — never from raw user input —
// and every value travels as a parameter to prevent SQL injection.
func (r *ProductRepository) Search(f ProductFilter) ([]models.Product, error) {
	var (
		where []string
		args  []any
	)

	if f.Query != "" {
		args = append(args, f.Query)
		ph := len(args)
		where = append(where, fmt.Sprintf(
			"(p.name ILIKE '%%' || $%d || '%%' OR p.description ILIKE '%%' || $%d || '%%')",
			ph, ph,
		))
	}
	if f.CategoryID > 0 {
		args = append(args, f.CategoryID)
		where = append(where, fmt.Sprintf("p.category_id = $%d", len(args)))
	}
	if f.MinPrice > 0 {
		args = append(args, f.MinPrice)
		where = append(where, fmt.Sprintf("p.price >= $%d", len(args)))
	}
	if f.MaxPrice > 0 {
		args = append(args, f.MaxPrice)
		where = append(where, fmt.Sprintf("p.price <= $%d", len(args)))
	}

	orderBy := "p.created_at DESC"
	switch f.Sort {
	case "price_asc":
		orderBy = "p.price ASC"
	case "price_desc":
		orderBy = "p.price DESC"
	case "popularity":
		orderBy = "popularity DESC, p.created_at DESC"
	}

	var sb strings.Builder
	sb.WriteString(`
		SELECT p.id, p.category_id, p.name, p.description, p.price, p.stock, p.created_at,
		       COALESCE(SUM(oi.quantity), 0) AS popularity
		FROM   products p
		LEFT   JOIN order_items oi ON oi.product_id = p.id
	`)
	if len(where) > 0 {
		sb.WriteString(" WHERE ")
		sb.WriteString(strings.Join(where, " AND "))
	}
	sb.WriteString(" GROUP BY p.id ORDER BY ")
	sb.WriteString(orderBy)

	if f.Limit > 0 {
		args = append(args, f.Limit)
		sb.WriteString(fmt.Sprintf(" LIMIT $%d", len(args)))
	}
	if f.Offset > 0 {
		args = append(args, f.Offset)
		sb.WriteString(fmt.Sprintf(" OFFSET $%d", len(args)))
	}

	rows, err := r.db.Query(sb.String(), args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		var popularity int
		if err := rows.Scan(
			&p.ID, &p.CategoryID, &p.Name, &p.Description,
			&p.Price, &p.Stock, &p.CreatedAt, &popularity,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	return products, rows.Err()
}

// GetByID returns a single product or (nil, nil) when not found.
func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	const q = `
		SELECT id, category_id, name, description, price, stock, created_at
		FROM   products
		WHERE  id = $1`

	var p models.Product
	err := r.db.QueryRow(q, id).Scan(
		&p.ID, &p.CategoryID, &p.Name, &p.Description,
		&p.Price, &p.Stock, &p.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// Create inserts a new product and returns the full row via RETURNING.
// RETURNING avoids a second SELECT and is idiomatic in PostgreSQL.
func (r *ProductRepository) Create(req models.CreateProductRequest) (*models.Product, error) {
	const q = `
		INSERT INTO products (category_id, name, description, price, stock)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, category_id, name, description, price, stock, created_at`

	var p models.Product
	err := r.db.QueryRow(q,
		req.CategoryID, req.Name, req.Description, req.Price, req.Stock,
	).Scan(
		&p.ID, &p.CategoryID, &p.Name, &p.Description,
		&p.Price, &p.Stock, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// Update replaces all mutable fields and returns the updated row.
// Returns (nil, nil) if the id does not exist.
func (r *ProductRepository) Update(id int, req models.UpdateProductRequest) (*models.Product, error) {
	const q = `
		UPDATE products
		SET    category_id = $1,
		       name        = $2,
		       description = $3,
		       price       = $4,
		       stock       = $5
		WHERE  id = $6
		RETURNING id, category_id, name, description, price, stock, created_at`

	var p models.Product
	err := r.db.QueryRow(q,
		req.CategoryID, req.Name, req.Description, req.Price, req.Stock, id,
	).Scan(
		&p.ID, &p.CategoryID, &p.Name, &p.Description,
		&p.Price, &p.Stock, &p.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// Delete removes a product by id.
// Returns (false, nil) when no row matched — caller decides the HTTP status.
func (r *ProductRepository) Delete(id int) (bool, error) {
	const q = `DELETE FROM products WHERE id = $1`

	result, err := r.db.Exec(q, id)
	if err != nil {
		return false, err
	}
	n, _ := result.RowsAffected()
	return n > 0, nil
}
