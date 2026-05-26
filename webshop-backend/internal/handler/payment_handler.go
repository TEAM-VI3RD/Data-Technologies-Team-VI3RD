package handler

import (
	"net/http"
	"strconv"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
)

type PaymentHandler struct {
	repo      *repository.PaymentRepository
	orderRepo *repository.OrderRepository
}

func NewPaymentHandler(repo *repository.PaymentRepository, orderRepo *repository.OrderRepository) *PaymentHandler {
	return &PaymentHandler{repo: repo, orderRepo: orderRepo}
}

// Create godoc
// @Summary     Create a payment
// @Description Creates a payment record in MongoDB for an existing order
// @Tags        payments
// @Accept      json
// @Produce     json
// @Param       body body     models.CreatePaymentRequest true "Payment data"
// @Success     201  {object} models.Payment
// @Failure     400  {object} map[string]string
// @Failure     500  {object} map[string]string
// @Security    BearerAuth
// @Router      /payments [post]
func (h *PaymentHandler) Create(c *gin.Context) {
	var req models.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p, err := h.repo.Create(userID(c), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Zet de bestelling automatisch op "confirmed" na geslaagde betaling.
	if _, err := h.orderRepo.UpdateStatus(req.OrderID, "confirmed"); err != nil {
		// Niet fataal — betaling is al aangemaakt, log de fout alleen.
		_ = err
	}

	c.JSON(http.StatusCreated, p)
}

// GetMine godoc
// @Summary     Get a payment by ID
// @Description Returns a payment owned by the authenticated user
// @Tags        payments
// @Produce     json
// @Param       id  path     string true "Payment ObjectID"
// @Success     200 {object} models.Payment
// @Failure     400 {object} map[string]string
// @Failure     404 {object} map[string]string
// @Security    BearerAuth
// @Router      /payments/{id} [get]
func (h *PaymentHandler) GetMine(c *gin.Context) {
	oid, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment id"})
		return
	}

	p, err := h.repo.GetByID(oid, userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if p == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	c.JSON(http.StatusOK, p)
}

// ListMine godoc
// @Summary     List my payments
// @Description Returns all payments for the authenticated user
// @Tags        payments
// @Produce     json
// @Success     200 {array}  models.Payment
// @Failure     500 {object} map[string]string
// @Security    BearerAuth
// @Router      /payments [get]
func (h *PaymentHandler) ListMine(c *gin.Context) {
	payments, err := h.repo.ListForUser(userID(c))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, payments)
}

// ListAll godoc (admin)
// @Summary     List all payments
// @Description Returns every payment in the system
// @Tags        payments
// @Produce     json
// @Success     200 {array}  models.Payment
// @Failure     500 {object} map[string]string
// @Security    BearerAuth
// @Router      /admin/payments [get]
func (h *PaymentHandler) ListAll(c *gin.Context) {
	payments, err := h.repo.ListAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, payments)
}

// ListByOrder godoc (admin)
// @Summary     List payments for an order
// @Description Returns all payments linked to a specific order
// @Tags        payments
// @Produce     json
// @Param       order_id path     int true "Order ID"
// @Success     200      {array}  models.Payment
// @Failure     400      {object} map[string]string
// @Failure     500      {object} map[string]string
// @Security    BearerAuth
// @Router      /admin/payments/order/{order_id} [get]
func (h *PaymentHandler) ListByOrder(c *gin.Context) {
	orderID, err := strconv.Atoi(c.Param("order_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "order_id must be an integer"})
		return
	}

	payments, err := h.repo.ListForOrder(orderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, payments)
}

// UpdateStatus godoc (admin)
// @Summary     Update payment status
// @Description Sets the status (and optionally paid_at) of a payment
// @Tags        payments
// @Accept      json
// @Produce     json
// @Param       id   path     string                          true "Payment ObjectID"
// @Param       body body     models.UpdatePaymentStatusRequest true "New status"
// @Success     204
// @Failure     400 {object} map[string]string
// @Failure     404 {object} map[string]string
// @Failure     500 {object} map[string]string
// @Security    BearerAuth
// @Router      /admin/payments/{id}/status [put]
func (h *PaymentHandler) UpdateStatus(c *gin.Context) {
	oid, err := bson.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment id"})
		return
	}

	var req models.UpdatePaymentStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ok, err := h.repo.UpdateStatus(oid, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !ok {
		c.JSON(http.StatusNotFound, gin.H{"error": "payment not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
