package models

import "github.com/shopspring/decimal"

type OrderItem struct {
	ID        int             `json:"id"`
	OrderID   int             `json:"order_id"`
	ProductID int             `json:"product_id"`
	Quantity  int             `json:"quantity"`
	UnitPrice decimal.Decimal `json:"unit_price"`
}
