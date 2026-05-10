package handler

import (
	"net/http"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type AdminHandler struct {
	repo *repository.UserRepository
}

func NewAdminHandler(repo *repository.UserRepository) *AdminHandler {
	return &AdminHandler{repo: repo}
}

func (h *AdminHandler) ListUsers(c *gin.Context) {
	users, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if users == nil {
		users = []models.User{}
	}
	c.JSON(http.StatusOK, users)
}

func (h *AdminHandler) BlockUser(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}

	user, err := h.repo.SetBlocked(id, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *AdminHandler) UnblockUser(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}

	user, err := h.repo.SetBlocked(id, false)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *AdminHandler) DeleteUser(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}

	found, err := h.repo.Delete(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.Status(http.StatusNoContent)
}
