package handler

import (
	"errors"
	"net/http"
	"strconv"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	repo *repository.CartRepository
}

func NewCartHandler(repo *repository.CartRepository) *CartHandler {
	return &CartHandler{repo: repo}
}

// userID extracts the authenticated user id set by middleware.Auth.
func userID(c *gin.Context) int {
	v, _ := c.Get("user_id")
	id, _ := v.(int)
	return id
}

// List returns the authenticated user's cart.
func (h *CartHandler) List(c *gin.Context) {
	items, err := h.repo.List(userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if items == nil {
		items = []models.CartItem{}
	}
	c.JSON(http.StatusOK, items)
}

// Add inserts or increments a cart item.
func (h *CartHandler) Add(c *gin.Context) {
	var req models.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.Add(userID(c), req.ProductID, req.Quantity); err != nil {
		if errors.Is(err, repository.ErrInsufficientStock) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusCreated)
}

// Update sets an absolute quantity for one cart row.
func (h *CartHandler) Update(c *gin.Context) {
	productID, err := strconv.Atoi(c.Param("product_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product_id must be an integer"})
		return
	}
	var req models.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ok, err := h.repo.UpdateQuantity(userID(c), productID, req.Quantity)
	if err != nil {
		if errors.Is(err, repository.ErrInsufficientStock) {
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart item not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

// Remove deletes one product from the cart.
func (h *CartHandler) Remove(c *gin.Context) {
	productID, err := strconv.Atoi(c.Param("product_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product_id must be an integer"})
		return
	}
	ok, err := h.repo.Remove(userID(c), productID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart item not found"})
		return
	}
	c.Status(http.StatusNoContent)
}
