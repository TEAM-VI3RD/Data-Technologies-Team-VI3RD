package models

type Address struct {
	ID          int    `json:"id"`
	UserID      int    `json:"user_id"`
	Type        string `json:"type"`
	FullName    string `json:"full_name"`
	Street      string `json:"street"`
	HouseNumber string `json:"house_number"`
	PostalCode  string `json:"postal_code"`
	City        string `json:"city"`
	Country     string `json:"country"`
}

type CreateAddressRequest struct {
	Type        string `json:"type"      binding:"required"`
	FullName    string `json:"full_name" binding:"required"`
	Street      string `json:"street"    binding:"required"`
	HouseNumber string `json:"house_number"`
	PostalCode  string `json:"postal_code"`
	City        string `json:"city"`
	Country     string `json:"country"`
}
