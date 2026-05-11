package models

import "time"

type Cart struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	CreatedAt time.Time `json:"created_at"`
}

type CartItem struct {
	ID          int       `json:"id"`
	CartID      int       `json:"cart_id"`
	ProductID   int       `json:"product_id"`
	ProductName string    `json:"product_name"`
	UnitPrice   float64   `json:"unit_price"`
	Quantity    int       `json:"quantity"`
	Subtotal    float64   `json:"subtotal"`
	AddedAt     time.Time `json:"added_at"`
}

type AddToCartRequest struct {
	ProductID int `json:"product_id" binding:"required,gt=0"`
	Quantity  int `json:"quantity"   binding:"required,gt=0"`
}

type UpdateCartItemRequest struct {
	Quantity int `json:"quantity" binding:"required,gt=0"`
}
