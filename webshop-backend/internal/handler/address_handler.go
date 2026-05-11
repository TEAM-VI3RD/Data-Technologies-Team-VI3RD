package handler

import (
	"net/http"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type AddressHandler struct {
	repo *repository.AddressRepository
}

func NewAddressHandler(repo *repository.AddressRepository) *AddressHandler {
	return &AddressHandler{repo: repo}
}

// List returns all addresses for the authenticated user.
func (h *AddressHandler) List(c *gin.Context) {
	addrs, err := h.repo.ListForUser(userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if addrs == nil {
		addrs = []models.Address{}
	}
	c.JSON(http.StatusOK, addrs)
}

// Create adds a new address for the authenticated user.
func (h *AddressHandler) Create(c *gin.Context) {
	var req models.CreateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	addr, err := h.repo.Create(userID(c), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, addr)
}

// Delete removes an address owned by the authenticated user.
func (h *AddressHandler) Delete(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	found, err := h.repo.Delete(id, userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "address not found"})
		return
	}
	c.Status(http.StatusNoContent)
}
