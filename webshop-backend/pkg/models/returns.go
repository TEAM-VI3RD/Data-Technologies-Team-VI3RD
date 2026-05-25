package models

import "time"

type Return struct {
	ID          int        `json:"id"`
	OrderID     int        `json:"order_id"`
	UserID      int        `json:"user_id"`
	Reason      string     `json:"reason"`
	Status      string     `json:"status"`
	RequestedAt time.Time  `json:"requested_at"`
	ResolvedAt  *time.Time `json:"resolved_at"`
}
