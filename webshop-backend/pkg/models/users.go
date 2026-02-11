package models

import "time"

type User struct {
	ID         int64     `json:"id"`    //pk
	Email      string    `json:"email"` // fk
	Password   string    `json:"password"`
	Created_At time.Time `json:"created_at"`
}
