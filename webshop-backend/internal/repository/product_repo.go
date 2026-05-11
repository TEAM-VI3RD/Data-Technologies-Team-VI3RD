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
	ActiveOnly bool    // true = only active products
	Limit      int     // 0 = no limit
	Offset     int
}

type ProductRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) *ProductRepository {
	return &ProductRepository{db: db}
}

// GetAll returns every product ordered newest-first with their category IDs.
func (r *ProductRepository) GetAll() ([]models.Product, error) {
	const q = `
		SELECT id, name, description, price, stock, active, created_at
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
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Active, &p.CreatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return r.loadCategoryIDs(products)
}

// Search returns products matching the given filter.
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
		where = append(where, fmt.Sprintf(
			"EXISTS (SELECT 1 FROM product_categories pc WHERE pc.product_id = p.id AND pc.category_id = $%d)",
			len(args),
		))
	}
	if f.MinPrice > 0 {
		args = append(args, f.MinPrice)
		where = append(where, fmt.Sprintf("p.price >= $%d", len(args)))
	}
	if f.MaxPrice > 0 {
		args = append(args, f.MaxPrice)
		where = append(where, fmt.Sprintf("p.price <= $%d", len(args)))
	}
	if f.ActiveOnly {
		where = append(where, "p.active = true")
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
		SELECT p.id, p.name, p.description, p.price, p.stock, p.active, p.created_at,
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
			&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Active, &p.CreatedAt, &popularity,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return r.loadCategoryIDs(products)
}

// GetByID returns a single product or (nil, nil) when not found.
func (r *ProductRepository) GetByID(id int) (*models.Product, error) {
	const q = `
		SELECT id, name, description, price, stock, active, created_at
		FROM   products
		WHERE  id = $1`

	var p models.Product
	err := r.db.QueryRow(q, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Active, &p.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	products, err := r.loadCategoryIDs([]models.Product{p})
	if err != nil {
		return nil, err
	}
	return &products[0], nil
}

// Create inserts a new product and assigns its categories.
func (r *ProductRepository) Create(req models.CreateProductRequest) (*models.Product, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	const q = `
		INSERT INTO products (name, description, price, stock, active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, description, price, stock, active, created_at`

	var p models.Product
	err = tx.QueryRow(q, req.Name, req.Description, req.Price, req.Stock, req.Active).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Active, &p.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if err := insertCategories(tx, p.ID, req.CategoryIDs); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	p.CategoryIDs = req.CategoryIDs
	return &p, nil
}

// Update replaces all mutable fields and resets categories.
// Returns (nil, nil) if the id does not exist.
func (r *ProductRepository) Update(id int, req models.UpdateProductRequest) (*models.Product, error) {
	tx, err := r.db.Begin()
	if err != nil {
		return nil, err
	}
	defer tx.Rollback()

	const q = `
		UPDATE products
		SET    name        = $1,
		       description = $2,
		       price       = $3,
		       stock       = $4,
		       active      = $5
		WHERE  id = $6
		RETURNING id, name, description, price, stock, active, created_at`

	var p models.Product
	err = tx.QueryRow(q, req.Name, req.Description, req.Price, req.Stock, req.Active, id).Scan(
		&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Active, &p.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if _, err := tx.Exec(`DELETE FROM product_categories WHERE product_id = $1`, id); err != nil {
		return nil, err
	}
	if err := insertCategories(tx, p.ID, req.CategoryIDs); err != nil {
		return nil, err
	}
	if err := tx.Commit(); err != nil {
		return nil, err
	}
	p.CategoryIDs = req.CategoryIDs
	return &p, nil
}

// Delete removes a product by id.
func (r *ProductRepository) Delete(id int) (bool, error) {
	result, err := r.db.Exec(`DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		return false, err
	}
	n, _ := result.RowsAffected()
	return n > 0, nil
}

// loadCategoryIDs fetches category_ids for a slice of products in one query.
func (r *ProductRepository) loadCategoryIDs(products []models.Product) ([]models.Product, error) {
	if len(products) == 0 {
		return products, nil
	}

	ids := make([]any, len(products))
	placeholders := make([]string, len(products))
	index := make(map[int]int) // product_id → slice index
	for i, p := range products {
		ids[i] = p.ID
		placeholders[i] = fmt.Sprintf("$%d", i+1)
		index[p.ID] = i
	}

	q := fmt.Sprintf(
		`SELECT product_id, category_id FROM product_categories WHERE product_id IN (%s)`,
		strings.Join(placeholders, ","),
	)
	rows, err := r.db.Query(q, ids...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var pid, cid int
		if err := rows.Scan(&pid, &cid); err != nil {
			return nil, err
		}
		i := index[pid]
		products[i].CategoryIDs = append(products[i].CategoryIDs, cid)
	}
	return products, rows.Err()
}

func insertCategories(tx *sql.Tx, productID int, categoryIDs []int) error {
	for _, cid := range categoryIDs {
		if _, err := tx.Exec(
			`INSERT INTO product_categories (product_id, category_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			productID, cid,
		); err != nil {
			return err
		}
	}
	return nil
}
