package main

import (
	"log"
	"net/http"
	"webshop-backend/internal/db"
	"webshop-backend/internal/handler"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Connect to PostgreSQL (exits on failure).
	db.Connect()

	// 2. Wire dependencies: DB → Repository → Handler.
	//    Dependency injection by hand — no DI framework needed at this scale.
	productRepo := repository.NewProductRepository(db.DB)
	productHandler := handler.NewProductHandler(productRepo)

	// 3. Configure the router.
	router := gin.Default()

	// Health check — useful for Docker/k8s readiness probes.
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Product routes.
	products := router.Group("/products")
	{
		products.GET("", productHandler.GetAll)
		products.GET("/:id", productHandler.GetByID)
		products.POST("", productHandler.Create)
		products.PUT("/:id", productHandler.Update)
		products.DELETE("/:id", productHandler.Delete)
	}

	// 4. Start HTTP server.
	if err := router.Run(":8080"); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
