package models

type Addresses struct {
	ID           int    `json:"id"`      //pk
	User_ID      int    `json:"user_id"` //fk
	Type         string `json:"type"`
	Full_name    string `json:"full_name"`
	Street       string `json:"street"`
	House_number string `json:"house_number"`
	Postal_code  string `json:"postal_code"`
	City         string `json:"city"`
	Country      string `json:"country"`
}
