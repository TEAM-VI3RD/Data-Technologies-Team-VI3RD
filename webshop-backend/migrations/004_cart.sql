-- ============================================================================
-- 004_cart.sql
-- Cart (winkelwagen) — one row per user/product combination.
-- Orders/order_items tables already exist in 001_init.sql.
-- ============================================================================

CREATE TABLE IF NOT EXISTS cart_items (
    id          SERIAL PRIMARY KEY,
    user_id     INT             NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    product_id  INT             NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INT             NOT NULL CHECK (quantity > 0),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_user_product UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
