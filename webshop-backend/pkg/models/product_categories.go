package models

type Product_Categories struct {
	Product_id  int `json:"id"` // pk, fk
	Category_id int `json:"id"` // pk, fk
}
