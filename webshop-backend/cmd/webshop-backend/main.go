package main

import (
	"log"
	"net/http"
	"webshop-backend/internal/db"
	"webshop-backend/internal/handler"
	"webshop-backend/internal/middleware"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Connect to PostgreSQL (exits on failure).
	db.Connect()

	// 2. Wire dependencies: DB → Repository → Handler.
	productRepo := repository.NewProductRepository(db.DB)
	productHandler := handler.NewProductHandler(productRepo)

	userRepo := repository.NewUserRepository(db.DB)
	authHandler := handler.NewAuthHandler(userRepo)
	adminHandler := handler.NewAdminHandler(userRepo)

	// 3. Configure the router.
	router := gin.Default()

	// Health check — useful for Docker/k8s readiness probes.
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Auth routes.
	auth := router.Group("/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Admin routes — JWT required + is_admin = true.
	admin := router.Group("/admin")
	admin.Use(middleware.Auth(), middleware.AdminOnly())
	{
		admin.GET("/users", adminHandler.ListUsers)
		admin.PUT("/users/:id/block", adminHandler.BlockUser)
		admin.PUT("/users/:id/unblock", adminHandler.UnblockUser)
		admin.DELETE("/users/:id", adminHandler.DeleteUser)
	}

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
