package models

import (
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
)

type Payment struct {
	ID            bson.ObjectID `bson:"_id,omitempty"  json:"id"`
	OrderID       int           `bson:"order_id"       json:"order_id"`
	UserID        int           `bson:"user_id"        json:"user_id"`
	Amount        float64       `bson:"amount"         json:"amount"`
	Method        string        `bson:"method"         json:"method"`
	Status        string        `bson:"status"         json:"status"`
	TransactionID string        `bson:"transaction_id" json:"transaction_id"`
	PaidAt        *time.Time    `bson:"paid_at"        json:"paid_at"`
	CreatedAt     time.Time     `bson:"created_at"     json:"created_at"`
}

type CreatePaymentRequest struct {
	OrderID       int     `json:"order_id"       binding:"required"`
	Amount        float64 `json:"amount"         binding:"required"`
	Method        string  `json:"method"         binding:"required,oneof=credit_card debit_card paypal ideal bank_transfer"`
	TransactionID string  `json:"transaction_id"`
}

type UpdatePaymentStatusRequest struct {
	Status string     `json:"status"  binding:"required,oneof=pending paid failed refunded"`
	PaidAt *time.Time `json:"paid_at"`
}
