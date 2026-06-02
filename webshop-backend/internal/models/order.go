package models

import "time"

type OrderItem struct {
	ID          int     `json:"id"`
	ProductID   int     `json:"product_id"`
	ProductName string  `json:"product_name"`
	Quantity    int     `json:"quantity"`
	UnitPrice   float64 `json:"unit_price"`
	Subtotal    float64 `json:"subtotal"`
}

type Order struct {
	ID                int         `json:"id"`
	UserID            int         `json:"user_id"`
	Status            string      `json:"status"`
	OrderDate         time.Time   `json:"order_date"`
	TotalAmount       float64     `json:"total_amount"`
	ShippingAddressID *int        `json:"shipping_address_id"`
	BillingAddressID  *int        `json:"billing_address_id"`
	CreatedAt         time.Time   `json:"created_at"`
	Items             []OrderItem `json:"items,omitempty"`
}

type PlaceOrderRequest struct {
	ShippingAddressID *int `json:"shipping_address_id"`
	BillingAddressID  *int `json:"billing_address_id"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending confirmed shipped delivered cancelled"`
}

type OrderFlowReport struct {
	OrderID              int       `json:"order_id"`
	UserID               int       `json:"user_id"`
	Status               string    `json:"status"`
	OrderDate            time.Time `json:"order_date"`
	TotalAmount          float64   `json:"total_amount"`
	ItemCount            int       `json:"item_count"`
	DistinctProductCount int       `json:"distinct_product_count"`
	TotalQuantity        int       `json:"total_quantity"`
	FirstOrderForUser    bool      `json:"first_order_for_user"`
	UserOrderNumber      int       `json:"user_order_number"`
	UserLifetimeValue    float64   `json:"user_lifetime_value"`
	AverageOrderValue    float64   `json:"average_order_value"`
}
