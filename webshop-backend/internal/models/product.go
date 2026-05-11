package models

import "time"

type Product struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Stock       int       `json:"stock"`
	Active      bool      `json:"active"`
	CreatedAt   time.Time `json:"created_at"`
	CategoryIDs []int     `json:"category_ids,omitempty"`
}

type CreateProductRequest struct {
	Name        string  `json:"name"        binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price"       binding:"required,gt=0"`
	Stock       int     `json:"stock"       binding:"gte=0"`
	Active      bool    `json:"active"`
	CategoryIDs []int   `json:"category_ids"`
}

type UpdateProductRequest struct {
	Name        string  `json:"name"        binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price"       binding:"required,gt=0"`
	Stock       int     `json:"stock"       binding:"gte=0"`
	Active      bool    `json:"active"`
	CategoryIDs []int   `json:"category_ids"`
}
