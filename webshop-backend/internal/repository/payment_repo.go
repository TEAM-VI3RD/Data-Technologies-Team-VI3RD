package repository

import (
	"context"
	"time"
	"webshop-backend/internal/models"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type PaymentRepository struct {
	col *mongo.Collection
}

func NewPaymentRepository(col *mongo.Collection) *PaymentRepository {
	return &PaymentRepository{col: col}
}

func (r *PaymentRepository) Create(userID int, req models.CreatePaymentRequest) (*models.Payment, error) {
	now := time.Now()
	p := models.Payment{
		ID:            bson.NewObjectID(),
		OrderID:       req.OrderID,
		UserID:        userID,
		Amount:        req.Amount,
		Method:        req.Method,
		Status:        "paid",
		TransactionID: req.TransactionID,
		PaidAt:        &now,
		CreatedAt:     now,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := r.col.InsertOne(ctx, p); err != nil {
		return nil, err
	}
	return &p, nil
}

// GetByID returns a payment by its MongoDB ObjectID.
// If ownerID > 0, the payment must belong to that user.
func (r *PaymentRepository) GetByID(id bson.ObjectID, ownerID int) (*models.Payment, error) {
	filter := bson.M{"_id": id}
	if ownerID > 0 {
		filter["user_id"] = ownerID
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var p models.Payment
	if err := r.col.FindOne(ctx, filter).Decode(&p); err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

// ListForUser returns all payments for a specific user, newest first.
func (r *PaymentRepository) ListForUser(userID int) ([]models.Payment, error) {
	return r.find(bson.M{"user_id": userID})
}

// ListForOrder returns all payments linked to a given order ID.
func (r *PaymentRepository) ListForOrder(orderID int) ([]models.Payment, error) {
	return r.find(bson.M{"order_id": orderID})
}

// ListAll returns every payment in the system (admin).
func (r *PaymentRepository) ListAll() ([]models.Payment, error) {
	return r.find(bson.M{})
}

// UpdateStatus changes status (and optionally paid_at) of a payment.
// Returns false when the document was not found.
func (r *PaymentRepository) UpdateStatus(id bson.ObjectID, req models.UpdatePaymentStatusRequest) (bool, error) {
	update := bson.M{"$set": bson.M{"status": req.Status}}
	if req.PaidAt != nil {
		update["$set"].(bson.M)["paid_at"] = req.PaidAt
	} else if req.Status == "paid" {
		now := time.Now()
		update["$set"].(bson.M)["paid_at"] = now
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	res, err := r.col.UpdateOne(ctx, bson.M{"_id": id}, update)
	if err != nil {
		return false, err
	}
	return res.MatchedCount > 0, nil
}

func (r *PaymentRepository) find(filter bson.M) ([]models.Payment, error) {
	opts := options.Find().SetSort(bson.M{"created_at": -1})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := r.col.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var payments []models.Payment
	if err := cursor.All(ctx, &payments); err != nil {
		return nil, err
	}
	if payments == nil {
		payments = []models.Payment{}
	}
	return payments, nil
}
