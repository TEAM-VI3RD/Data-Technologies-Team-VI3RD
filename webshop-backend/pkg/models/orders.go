package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type Order struct {
	ID                int             `json:"id"`
	UserID            int             `json:"user_id"`
	Status            string          `json:"status"`
	OrderDate         time.Time       `json:"order_date"`
	TotalAmount       decimal.Decimal `json:"total_amount"`
	ShippingAddressID *int            `json:"shipping_address_id"`
	BillingAddressID  *int            `json:"billing_address_id"`
}
