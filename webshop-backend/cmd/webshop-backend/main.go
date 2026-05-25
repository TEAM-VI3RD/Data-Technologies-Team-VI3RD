package main

import (
	"context"
	"log"
	"net/http"
	"strconv"
	"time"
	"webshop-backend/internal/db"
	"webshop-backend/pkg/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

// @title Webshop API
// @version 1.0
// @description Simple webshop backend in Go using raw SQL and MongoDB
// @host localhost:8080
// @BasePath /

func main() {
	db.Connect()
	db.ConnectMongo()

	router := gin.Default()

	router.GET("/products", getProducts)

	router.POST("/payments", createPayment)
	router.GET("/payments/:id", getPaymentByID)
	router.GET("/payments/order/:order_id", getPaymentsByOrder)

	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

// getProducts godoc
// @Summary Get all products
// @Description Retrieves all products from the database
// @Tags products
// @Produce json
// @Success 200 {array} models.Product
// @Failure 500 {object} gin.H{"error": "string"}
// @Router /products [get]
func getProducts(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, name, description, price, stock, active, created_at FROM products")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot query database"})
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock, &p.Active, &p.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
			return
		}
		products = append(products, p)
	}

	c.JSON(http.StatusOK, products)
}

// createPayment godoc
// @Summary Create a payment
// @Description Stores a new payment record in MongoDB
// @Tags payments
// @Accept json
// @Produce json
// @Param payment body models.CreatePaymentRequest true "Payment data"
// @Success 201 {object} models.Payment
// @Failure 400 {object} gin.H{"error": "string"}
// @Failure 500 {object} gin.H{"error": "string"}
// @Router /payments [post]
func createPayment(c *gin.Context) {
	var req models.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	now := time.Now()
	payment := models.Payment{
		ID:            bson.NewObjectID(),
		OrderID:       req.OrderID,
		UserID:        req.UserID,
		Amount:        req.Amount,
		Method:        req.Method,
		Status:        "pending",
		TransactionID: req.TransactionID,
		CreatedAt:     now,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if _, err := db.Payments().InsertOne(ctx, payment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save payment"})
		return
	}

	c.JSON(http.StatusCreated, payment)
}

// getPaymentByID godoc
// @Summary Get a payment by ID
// @Description Retrieves a payment from MongoDB by its ObjectID
// @Tags payments
// @Produce json
// @Param id path string true "Payment ObjectID"
// @Success 200 {object} models.Payment
// @Failure 400 {object} gin.H{"error": "string"}
// @Failure 404 {object} gin.H{"error": "string"}
// @Router /payments/{id} [get]
func getPaymentByID(c *gin.Context) {
	oid, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid payment ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var payment models.Payment
	if err := db.Payments().FindOne(ctx, bson.M{"_id": oid}).Decode(&payment); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, payment)
}

// getPaymentsByOrder godoc
// @Summary Get payments by order ID
// @Description Retrieves all payments for a given order from MongoDB
// @Tags payments
// @Produce json
// @Param order_id path int true "Order ID"
// @Success 200 {array} models.Payment
// @Failure 400 {object} gin.H{"error": "string"}
// @Failure 500 {object} gin.H{"error": "string"}
// @Router /payments/order/{order_id} [get]
func getPaymentsByOrder(c *gin.Context) {
	orderID, err := strconv.Atoi(c.Param("order_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := db.Payments().Find(ctx, bson.M{"order_id": orderID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query payments"})
		return
	}
	defer cursor.Close(ctx)

	var payments []models.Payment
	if err := cursor.All(ctx, &payments); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode payments"})
		return
	}

	c.JSON(http.StatusOK, payments)
}
