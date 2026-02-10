package main

import (
	"log"
	"net/http"
	"webshop-backend/internal/db"
	"webshop-backend/pkg/models"

	"github.com/gin-gonic/gin"
)

// @title Webshop API
// @version 1.0
// @description Simple webshop backend in Go using raw SQL
// @host localhost:8080
// @BasePath /

func main() {
	// Verbind met database
	db.Connect()

	// Gin router
	router := gin.Default()

	// Routes
	router.GET("/products", getProducts)

	// Start server
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
	rows, err := db.DB.Query("SELECT id, name, description, price FROM products")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot query database"})
		return
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan row"})
			return
		}
		products = append(products, p)
	}

	c.JSON(http.StatusOK, products)
}
