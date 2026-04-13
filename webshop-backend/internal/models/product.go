package models

import "time"

// Product mirrors the products table.
type Product struct {
	ID          int       `json:"id"`
	CategoryID  int       `json:"category_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	CreatedAt   time.Time `json:"created_at"`
}

// CreateProductRequest is the body expected for POST /products.
type CreateProductRequest struct {
	CategoryID  int     `json:"category_id" binding:"required"`
	Name        string  `json:"name"        binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price"       binding:"required,gt=0"`
	Stock       int     `json:"stock"       binding:"gte=0"`
}

// UpdateProductRequest is the body expected for PUT /products/:id.
// Same fields as Create — kept separate so they can diverge later.
type UpdateProductRequest struct {
	CategoryID  int     `json:"category_id" binding:"required"`
	Name        string  `json:"name"        binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price"       binding:"required,gt=0"`
	Stock       int     `json:"stock"       binding:"gte=0"`
}
