package handler

import (
	"errors"
	"net/http"
	"strconv"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	repo *repository.OrderRepository
}

func NewOrderHandler(repo *repository.OrderRepository) *OrderHandler {
	return &OrderHandler{repo: repo}
}

// Place godoc
// @Summary     Place an order from the authenticated user's cart
// @Tags        orders
// @Accept      json
// @Produce     json
// @Security    BearerAuth
// @Param       body body models.PlaceOrderRequest false "Order data"
// @Success     201 {object} models.Order
// @Failure     400 {object} map[string]string
// @Failure     409 {object} map[string]string
// @Router      /orders [post]
// Place turns the authenticated user's cart into a new order.
func (h *OrderHandler) Place(c *gin.Context) {
	var req models.PlaceOrderRequest
	// Body is optional; ignore bind errors (no required fields).
	_ = c.ShouldBindJSON(&req)

	uid := userID(c)
	id, err := h.repo.PlaceOrder(uid, req)
	if err != nil {
		switch {
		case errors.Is(err, repository.ErrEmptyCart):
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		case errors.Is(err, repository.ErrInsufficientStock):
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	order, err := h.repo.GetByID(id, uid)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

// ListMine godoc
// @Summary     List my orders
// @Tags        orders
// @Produce     json
// @Security    BearerAuth
// @Success     200 {array} models.Order
// @Router      /orders [get]
// ListMine returns the authenticated user's own orders.
func (h *OrderHandler) ListMine(c *gin.Context) {
	orders, err := h.repo.ListForUser(userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if orders == nil {
		orders = []models.Order{}
	}
	c.JSON(http.StatusOK, orders)
}

// GetMine godoc
// @Summary     Get my order by ID
// @Tags        orders
// @Produce     json
// @Security    BearerAuth
// @Param       id path int true "Order ID"
// @Success     200 {object} models.Order
// @Failure     404 {object} map[string]string
// @Router      /orders/{id} [get]
// GetMine returns a single order owned by the authenticated user.
func (h *OrderHandler) GetMine(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id must be an integer"})
		return
	}

	o, err := h.repo.GetByID(id, userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if o == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	c.JSON(http.StatusOK, o)
}

// ListAll godoc
// @Summary     List all orders (admin)
// @Tags        admin
// @Produce     json
// @Security    BearerAuth
// @Success     200 {array} models.Order
// @Router      /admin/orders [get]
// ListAll (admin) returns every order.
func (h *OrderHandler) ListAll(c *gin.Context) {
	orders, err := h.repo.ListAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if orders == nil {
		orders = []models.Order{}
	}
	c.JSON(http.StatusOK, orders)
}

// GetAny godoc
// @Summary     Get any order by ID (admin)
// @Tags        admin
// @Produce     json
// @Security    BearerAuth
// @Param       id path int true "Order ID"
// @Success     200 {object} models.Order
// @Failure     404 {object} map[string]string
// @Router      /admin/orders/{id} [get]
// GetAny (admin) returns one order regardless of owner.
func (h *OrderHandler) GetAny(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id must be an integer"})
		return
	}

	o, err := h.repo.GetByID(id, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if o == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	c.JSON(http.StatusOK, o)
}

// UpdateStatus godoc
// @Summary     Update order status (admin)
// @Tags        admin
// @Accept      json
// @Security    BearerAuth
// @Param       id path int true "Order ID"
// @Param       body body models.UpdateOrderStatusRequest true "New status"
// @Success     204
// @Failure     400 {object} map[string]string
// @Failure     404 {object} map[string]string
// @Router      /admin/orders/{id} [put]
// UpdateStatus (admin) sets the order status.
func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id must be an integer"})
		return
	}

	var req models.UpdateOrderStatusRequest
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
		c.JSON(http.StatusNotFound, gin.H{"error": "order not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
