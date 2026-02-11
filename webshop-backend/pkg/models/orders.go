package models

import (
	"time"

	"github.com/shopspring/decimal"
)

type Order struct {
	ID               int             `json:"id"`      //pk
	User_ID          int             `json:"user_id"` //fk
	Status           string          `json:"status"`
	Total_amount     decimal.Decimal `json:"total_amount"`
	OrderDate        time.Time       `json:"order_date"`
	Shipping_Address string          `json:"shipping_address"` //fk
	Billing_Address  string          `json:"billing_address"`  //fk
}
