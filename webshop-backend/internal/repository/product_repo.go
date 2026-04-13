package repository

import (
	"database/sql"
	"webshop-backend/internal/models"
)

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
