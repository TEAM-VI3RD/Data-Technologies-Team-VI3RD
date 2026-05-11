package handler

import (
	"net/http"
	"strconv"
	"webshop-backend/internal/models"
	"webshop-backend/internal/repository"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	repo *repository.ProductRepository
}

func NewProductHandler(repo *repository.ProductRepository) *ProductHandler {
	return &ProductHandler{repo: repo}
}

// GetAll godoc
// @Summary     List products
// @Description Returns all products. Supports filtering via query params.
// @Tags        products
// @Produce     json
// @Param       q           query    string  false "Search term"
// @Param       category_id query    int     false "Filter by category ID"
// @Param       min_price   query    number  false "Minimum price"
// @Param       max_price   query    number  false "Maximum price"
// @Param       sort        query    string  false "Sort: new, price_asc, price_desc, popularity"
// @Param       limit       query    int     false "Max results"
// @Param       offset      query    int     false "Pagination offset"
// @Success     200 {array}  models.Product
// @Failure     500 {object} map[string]string
// @Router      /products [get]
func (h *ProductHandler) GetAll(c *gin.Context) {
	filter := repository.ProductFilter{
		Query: c.Query("q"),
		Sort:  c.Query("sort"),
	}
	if v, err := strconv.Atoi(c.Query("category_id")); err == nil {
		filter.CategoryID = v
	}
	if v, err := strconv.ParseFloat(c.Query("min_price"), 64); err == nil {
		filter.MinPrice = v
	}
	if v, err := strconv.ParseFloat(c.Query("max_price"), 64); err == nil {
		filter.MaxPrice = v
	}
	if v, err := strconv.Atoi(c.Query("limit")); err == nil {
		filter.Limit = v
	}
	if v, err := strconv.Atoi(c.Query("offset")); err == nil {
		filter.Offset = v
	}

	products, err := h.repo.Search(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if products == nil {
		products = []models.Product{}
	}
	c.JSON(http.StatusOK, products)
}

// GetByID godoc
// @Summary     Get a product
// @Tags        products
// @Produce     json
// @Param       id  path     int true "Product ID"
// @Success     200 {object} models.Product
// @Failure     404 {object} map[string]string
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
// @Tags        products
// @Accept      json
// @Produce     json
// @Param       body body     models.CreateProductRequest true "Product data"
// @Success     201  {object} models.Product
// @Failure     400  {object} map[string]string
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
// @Tags        products
// @Accept      json
// @Produce     json
// @Param       id   path     int                        true "Product ID"
// @Param       body body     models.UpdateProductRequest true "Product data"
// @Success     200  {object} models.Product
// @Failure     404  {object} map[string]string
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
// @Tags        products
// @Param       id  path int true "Product ID"
// @Success     204
// @Failure     404 {object} map[string]string
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
