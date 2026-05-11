// @title           Webshop API
// @version         1.0
// @description     REST API voor de Data Technologies webshop (Go + PostgreSQL)
// @host            localhost:8080
// @BasePath        /
// @securityDefinitions.apikey BearerAuth
// @in              header
// @name            Authorization
// @description     Voer in: Bearer {token}
package main

import (
	"log"
	"net/http"
	"webshop-backend/internal/db"
	"webshop-backend/internal/handler"
	"webshop-backend/internal/middleware"
	"webshop-backend/internal/repository"
	_ "webshop-backend/docs"

	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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

	cartRepo := repository.NewCartRepository(db.DB)
	cartHandler := handler.NewCartHandler(cartRepo)

	addressRepo := repository.NewAddressRepository(db.DB)
	addressHandler := handler.NewAddressHandler(addressRepo)

	orderRepo := repository.NewOrderRepository(db.DB)
	orderHandler := handler.NewOrderHandler(orderRepo)

	returnRepo := repository.NewReturnRepository(db.DB)
	returnHandler := handler.NewReturnHandler(returnRepo)

	// 3. Configure the router.
	router := gin.Default()

	// Swagger UI — bereikbaar op http://localhost:8080/swagger/index.html
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// Health check.
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

		admin.GET("/returns", returnHandler.ListAll)
		admin.PUT("/returns/:id/status", returnHandler.UpdateStatus)

		admin.GET("/orders", orderHandler.ListAll)
		admin.GET("/orders/:id", orderHandler.GetAny)
		admin.PUT("/orders/:id/status", orderHandler.UpdateStatus)
	}

	// Address routes — authenticated customers only.
	addresses := router.Group("/addresses")
	addresses.Use(middleware.Auth())
	{
		addresses.GET("", addressHandler.List)
		addresses.POST("", addressHandler.Create)
		addresses.DELETE("/:id", addressHandler.Delete)
	}

	// Cart routes — authenticated customers only.
	cart := router.Group("/cart")
	cart.Use(middleware.Auth())
	{
		cart.GET("", cartHandler.List)
		cart.POST("", cartHandler.Add)
		cart.PUT("/:product_id", cartHandler.Update)
		cart.DELETE("/:product_id", cartHandler.Remove)
	}

	// Return routes — authenticated customers only.
	returns := router.Group("/returns")
	returns.Use(middleware.Auth())
	{
		returns.POST("", returnHandler.Create)
		returns.GET("", returnHandler.ListMine)
	}

	// Order routes — authenticated customers only.
	orders := router.Group("/orders")
	orders.Use(middleware.Auth())
	{
		orders.POST("", orderHandler.Place)
		orders.GET("", orderHandler.ListMine)
		orders.GET("/:id", orderHandler.GetMine)
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
