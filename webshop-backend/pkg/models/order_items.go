package models

import "github.com/shopspring/decimal"

type Order_Item struct {
	ID         int             `json:"id"`
	Order_ID   int             `json:"order_id"`
	Product_ID int             `json:"product_id"`
	Quantity   int             `json:"quantity"`
	Unit_price decimal.Decimal `json:"unit_price"`
}
