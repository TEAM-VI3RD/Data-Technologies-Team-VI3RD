package models

import "time"

// OrderItem mirrors the order_items table with product name for display.
type OrderItem struct {
	ID          int     `json:"id"`
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Subtotal    float64 `json:"subtotal"`
}

// Order mirrors the orders table.
type Order struct {
	ID        int         `json:"id"`
	UserID    int         `json:"user_id"`
	Status    string      `json:"status"`
	Total     float64     `json:"total"`
	CreatedAt time.Time   `json:"created_at"`
	Items     []OrderItem `json:"items,omitempty"`
}

// UpdateOrderStatusRequest is the admin body for PUT /admin/orders/:id/status.
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending confirmed shipped delivered cancelled"`
}
