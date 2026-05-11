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

// List godoc
// @Summary     List my addresses
// @Tags        addresses
// @Produce     json
// @Security    BearerAuth
// @Success     200 {array}  models.Address
// @Router      /addresses [get]
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

// Create godoc
// @Summary     Add an address
// @Tags        addresses
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       body body     models.CreateAddressRequest true "Address data"
// @Success     201  {object} models.Address
// @Failure     400  {object} map[string]string
// @Router      /addresses [post]
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

// Delete godoc
// @Summary     Delete an address
// @Tags        addresses
// @Security    BearerAuth
// @Param       id path int true "Address ID"
// @Success     204
// @Failure     404 {object} map[string]string
// @Router      /addresses/{id} [delete]
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
