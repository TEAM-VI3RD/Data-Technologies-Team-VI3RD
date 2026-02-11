package models

type Categories struct {
	ID   int64  `json:"id"`   //pk
	Name string `json:"name"` // Unique
}
