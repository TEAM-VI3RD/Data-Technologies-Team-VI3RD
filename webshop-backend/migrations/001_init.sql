-- =============================================================================
-- Webshop Database Schema — PostgreSQL
-- Normalized to Third Normal Form (3NF)
--
-- 3NF rules satisfied:
--   1NF: every column holds atomic values, no repeating groups
--   2NF: all non-key columns depend on the FULL primary key (no partial deps)
--   3NF: no transitive dependencies (e.g. category name lives in categories,
--        not in products; unit_price is captured at order time, not derived)
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. categories
--    Independent lookup table — products reference it by FK.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL,
    CONSTRAINT uq_categories_name UNIQUE (name),
    CONSTRAINT uq_categories_slug UNIQUE (slug)
);

-- ----------------------------------------------------------------------------
-- 2. products
--    Depends only on its own PK (id).
--    category_id → categories (no category data duplicated here).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    category_id INT             NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name        VARCHAR(255)    NOT NULL,
    description TEXT,
    price       NUMERIC(10, 2)  NOT NULL CHECK (price >= 0),
    stock       INT             NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. users
--    Owns identity data only; no order data stored here (avoids transitive dep).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL,
    full_name   VARCHAR(255)    NOT NULL,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email)
);

-- ----------------------------------------------------------------------------
-- 4. orders
--    One row per order. Status is an enum-like VARCHAR with a CHECK constraint.
--    Total price is NOT stored here — it is derived from order_items (avoids
--    transitive dependency on item prices).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    user_id     INT             NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status      VARCHAR(20)     NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. order_items
--    Junction table between orders and products.
--    unit_price is snapshotted at order time so historical prices are preserved
--    (if products.price changes later, old order totals stay correct).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL PRIMARY KEY,
    order_id    INT             NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
    product_id  INT             NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity    INT             NOT NULL CHECK (quantity > 0),
    unit_price  NUMERIC(10, 2)  NOT NULL CHECK (unit_price >= 0)
);

-- =============================================================================
-- Indexes for foreign keys and common query patterns
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category_id     ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id           ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id     ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id   ON order_items(product_id);

-- =============================================================================
-- Seed data
-- =============================================================================
INSERT INTO categories (name, slug) VALUES
    ('Electronics',  'electronics'),
    ('Clothing',     'clothing'),
    ('Books',        'books')
ON CONFLICT DO NOTHING;

INSERT INTO products (category_id, name, description, price, stock) VALUES
    (1, 'Laptop',       'High-performance laptop',   999.99, 10),
    (1, 'Smartphone',   '5G capable smartphone',     599.99, 25),
    (1, 'Headphones',   'Noise-cancelling headphones',199.99, 50),
    (2, 'T-Shirt',      '100% cotton t-shirt',        19.99, 200),
    (3, 'Go Programming', 'Learn Go from scratch',    39.99, 75)
ON CONFLICT DO NOTHING;
