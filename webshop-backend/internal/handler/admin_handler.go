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

// ListUsers godoc
// @Summary     List all users (admin)
// @Tags        admin
// @Produce     json
// @Security    BearerAuth
// @Success     200 {array}  models.User
// @Router      /admin/users [get]
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

// BlockUser godoc
// @Summary     Block a user (admin)
// @Tags        admin
// @Security    BearerAuth
// @Param       id path int true "User ID"
// @Success     200 {object} models.User
// @Failure     404 {object} map[string]string
// @Router      /admin/users/{id}/block [put]
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

// UnblockUser godoc
// @Summary     Unblock a user (admin)
// @Tags        admin
// @Security    BearerAuth
// @Param       id path int true "User ID"
// @Success     200 {object} models.User
// @Failure     404 {object} map[string]string
// @Router      /admin/users/{id}/unblock [put]
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

// DeleteUser godoc
// @Summary     Delete a user (admin)
// @Tags        admin
// @Security    BearerAuth
// @Param       id path int true "User ID"
// @Success     204
// @Failure     404 {object} map[string]string
// @Router      /admin/users/{id} [delete]
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
