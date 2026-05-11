package handler

import (
	"errors"
	"net/http"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type ReturnHandler struct {
	repo *repository.ReturnRepository
}

func NewReturnHandler(repo *repository.ReturnRepository) *ReturnHandler {
	return &ReturnHandler{repo: repo}
}

// Create submits a return request for an order owned by the authenticated user.
func (h *ReturnHandler) Create(c *gin.Context) {
	var req models.CreateReturnRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ret, err := h.repo.Create(userID(c), req)
	if err != nil {
		if errors.Is(err, repository.ErrOrderNotOwned) {
			c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, ret)
}

// ListMine returns the authenticated user's own return requests.
func (h *ReturnHandler) ListMine(c *gin.Context) {
	returns, err := h.repo.ListForUser(userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if returns == nil {
		returns = []models.Return{}
	}
	c.JSON(http.StatusOK, returns)
}

// ListAll (admin) returns every return request.
func (h *ReturnHandler) ListAll(c *gin.Context) {
	returns, err := h.repo.ListAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if returns == nil {
		returns = []models.Return{}
	}
	c.JSON(http.StatusOK, returns)
}

// UpdateStatus (admin) updates the status of a return request.
func (h *ReturnHandler) UpdateStatus(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}
	var req models.UpdateReturnStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	ok, err := h.repo.UpdateStatus(id, req.Status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "return not found"})
		return
	}
	c.Status(http.StatusNoContent)
}
