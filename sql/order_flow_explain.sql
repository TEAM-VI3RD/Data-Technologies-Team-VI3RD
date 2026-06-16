-- =============================================================================
-- TechCycle order-flow SQL evidence
-- Use this file in PostgreSQL/pgAdmin/psql after Docker Compose has started.
--
-- Purpose for the Data Technologies assessment:
--   1. Show that the order flow uses transactional, relational SQL.
--   2. Show where indexes support the most important order/cart queries.
--   3. Provide EXPLAIN ANALYZE output for the technical report and test report.
--
-- psql users can set example variables with:
--   \set cart_id 1
--   \set order_id 1
-- pgAdmin users can replace :cart_id and :order_id manually.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Order placement read phase
-- Mirrors internal/repository/order_repo.go PlaceOrder().
-- Replace :cart_id with an existing cart.id.
--
-- Why this matters:
--   - JOIN connects cart rows to product stock and price.
--   - ORDER BY p.id gives a stable lock order to reduce deadlock risk.
--   - FOR UPDATE OF p locks product rows so concurrent orders cannot oversell.
--   - idx_cart_items_cart_id supports filtering the cart_items rows.
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS)
SELECT p.id, p.price, p.stock, ci.quantity
FROM   cart_items ci
JOIN   products   p ON p.id = ci.product_id
WHERE  ci.cart_id = :cart_id
ORDER  BY p.id
FOR    UPDATE OF p;

-- -----------------------------------------------------------------------------
-- 2. Order detail read query
-- Mirrors internal/repository/order_repo.go GetByID().
-- Replace :order_id with an existing orders.id.
--
-- Why this matters:
--   - JOIN retrieves product names together with order item snapshots.
--   - subtotal is calculated in SQL for every order line.
--   - idx_order_items_order_id supports filtering order_items by order_id.
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS)
SELECT oi.id, oi.product_id, p.name, oi.quantity, oi.unit_price,
       oi.quantity * oi.unit_price AS subtotal
FROM   order_items oi
JOIN   products    p ON p.id = oi.product_id
WHERE  oi.order_id = :order_id;

-- -----------------------------------------------------------------------------
-- 3. Advanced order-flow report
-- Mirrors OrderRepository.OrderFlowReport().
--
-- Advanced SQL evidence:
--   - CTE order_line_totals aggregates order lines.
--   - COUNT(DISTINCT ...) measures product variety per order.
--   - ROW_NUMBER() ranks each customer's order sequence.
--   - SUM(...) OVER and AVG(...) OVER calculate customer lifetime metrics.
-- -----------------------------------------------------------------------------
EXPLAIN (ANALYZE, BUFFERS)
WITH order_line_totals AS (
    SELECT
        o.id AS order_id,
        COUNT(oi.id) AS item_count,
        COUNT(DISTINCT oi.product_id) AS distinct_product_count,
        COALESCE(SUM(oi.quantity), 0) AS total_quantity
    FROM   orders o
    LEFT   JOIN order_items oi ON oi.order_id = o.id
    GROUP  BY o.id
),
order_rankings AS (
    SELECT
        o.id,
        o.user_id,
        o.status,
        o.order_date,
        o.total_amount,
        ROW_NUMBER() OVER (
            PARTITION BY o.user_id
            ORDER BY o.order_date, o.id
        ) AS user_order_number,
        SUM(o.total_amount) OVER (
            PARTITION BY o.user_id
        ) AS user_lifetime_value,
        AVG(o.total_amount) OVER (
            PARTITION BY o.user_id
        ) AS average_order_value
    FROM orders o
)
SELECT
    r.id,
    r.user_id,
    r.status,
    r.order_date,
    r.total_amount,
    olt.item_count,
    olt.distinct_product_count,
    olt.total_quantity,
    (r.user_order_number = 1) AS first_order_for_user,
    r.user_order_number,
    r.user_lifetime_value,
    r.average_order_value
FROM   order_rankings r
JOIN   order_line_totals olt ON olt.order_id = r.id
ORDER  BY r.order_date DESC, r.id DESC;
