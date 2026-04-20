package handler

import (
	"net/http"
	"strconv"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

// ProductHandler wires HTTP concerns to the repository.
// It has no SQL knowledge — that stays in the repository layer.
type ProductHandler struct {
	repo *repository.ProductRepository
}

func NewProductHandler(repo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{repo: repo}
}

// GetAll godoc
// @Summary     List products
// @Description Returns all products ordered newest-first
// @Tags        products
// @Produce     json
// @Success     200 {array}  models.Product
// @Failure     500 {object} gin.H
// @Router      /products [get]
func (h *ProductHandler) GetAll(c *gin.Context) {
	products, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	// Return an empty array, not null, when there are no products.
	if products == nil {
		products = []models.Product{}
	}
	c.JSON(http.StatusOK, products)
}

// GetByID godoc
// @Summary     Get a product
// @Description Returns one product by id
// @Tags        products
// @Produce     json
// @Param       id  path     int true "Product ID"
// @Success     200 {object} models.Product
// @Failure     400 {object} gin.H
// @Failure     404 {object} gin.H
// @Failure     500 {object} gin.H
// @Router      /products/{id} [get]
func (h *ProductHandler) GetByID(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}

	p, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if p == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

// Create godoc
// @Summary     Create a product
// @Description Inserts a new product
// @Tags        products
// @Accept      json
// @Produce     json
// @Param       body body     models.CreateProductRequest true "Product data"
// @Success     201  {object} models.Product
// @Failure     400  {object} gin.H
// @Failure     500  {object} gin.H
// @Router      /products [post]
func (h *ProductHandler) Create(c *gin.Context) {
	var req models.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p, err := h.repo.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}

// Update godoc
// @Summary     Update a product
// @Description Replaces all fields of an existing product
// @Tags        products
// @Accept      json
// @Produce     json
// @Param       id   path     int true "Product ID"
// @Param       body body     models.UpdateProductRequest true "Product data"
// @Success     200  {object} models.Product
// @Failure     400  {object} gin.H
// @Failure     404  {object} gin.H
// @Failure     500  {object} gin.H
// @Router      /products/{id} [put]
func (h *ProductHandler) Update(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}

	var req models.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	p, err := h.repo.Update(id, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if p == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.JSON(http.StatusOK, p)
}

// Delete godoc
// @Summary     Delete a product
// @Description Removes a product by id
// @Tags        products
// @Param       id  path int true "Product ID"
// @Success     204
// @Failure     400 {object} gin.H
// @Failure     404 {object} gin.H
// @Failure     500 {object} gin.H
// @Router      /products/{id} [delete]
func (h *ProductHandler) Delete(c *gin.Context) {
	id, err := parseID(c)
	if err != nil {
		return
	}

	found, err := h.repo.Delete(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if !found {
		c.JSON(http.StatusNotFound, gin.H{"error": "product not found"})
		return
	}
	c.Status(http.StatusNoContent)
}

// parseID reads the :id route parameter and writes a 400 on failure.
func parseID(c *gin.Context) (int, error) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "id must be an integer"})
	}
	return id, err
}
