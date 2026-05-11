-- =============================================================================
-- 005_align_to_new_erd.sql
-- Aligns the database schema to the updated ERD.
--
-- Changes:
--   - categories: drop slug column
--   - products: add active, drop category_id → many-to-many via product_categories
--   - users: drop full_name (moves to addresses)
--   - addresses: new table
--   - orders: add order_date, total_amount, shipping_address_id, billing_address_id
--   - cart: new dedicated cart table; cart_items now references cart.id
--   - returns: new table
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. categories — drop slug
-- ----------------------------------------------------------------------------
ALTER TABLE categories DROP COLUMN IF EXISTS slug;

-- ----------------------------------------------------------------------------
-- 2. products — add active flag, migrate category → junction table
-- ----------------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS product_categories (
    product_id  INT NOT NULL REFERENCES products(id)   ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    PRIMARY KEY (product_id, category_id)
);

-- Migrate existing single-category assignment to the junction table.
INSERT INTO product_categories (product_id, category_id)
SELECT id, category_id
FROM   products
WHERE  category_id IS NOT NULL
ON CONFLICT DO NOTHING;

DROP INDEX  IF EXISTS idx_products_category_id;
ALTER TABLE products DROP COLUMN IF EXISTS category_id;

-- ----------------------------------------------------------------------------
-- 3. users — drop full_name (it lives in addresses now)
-- ----------------------------------------------------------------------------
ALTER TABLE users DROP COLUMN IF EXISTS full_name;

-- ----------------------------------------------------------------------------
-- 4. addresses
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
    id           SERIAL PRIMARY KEY,
    user_id      INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         VARCHAR(50)  NOT NULL,
    full_name    VARCHAR(255) NOT NULL,
    street       VARCHAR(255) NOT NULL,
    house_number VARCHAR(20),
    postal_code  VARCHAR(20),
    city         VARCHAR(100),
    country      VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);

-- ----------------------------------------------------------------------------
-- 5. orders — add address references, order_date, stored total
-- ----------------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_date         TIMESTAMPTZ    NOT NULL DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount       NUMERIC(10, 2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_id INT REFERENCES addresses(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address_id  INT REFERENCES addresses(id) ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- 6. cart — replace flat cart_items (user_id) with cart + cart_items (cart_id)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS cart_items;

CREATE TABLE IF NOT EXISTS cart (
    id         SERIAL PRIMARY KEY,
    user_id    INT         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_user UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         SERIAL PRIMARY KEY,
    cart_id    INT         NOT NULL REFERENCES cart(id)     ON DELETE CASCADE,
    product_id INT         NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity   INT         NOT NULL CHECK (quantity > 0),
    added_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cart_product UNIQUE (cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user_id       ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);

-- ----------------------------------------------------------------------------
-- 7. returns
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS returns (
    id           SERIAL PRIMARY KEY,
    order_id     INT         NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    user_id      INT         NOT NULL REFERENCES users(id)  ON DELETE RESTRICT,
    reason       TEXT,
    status       VARCHAR(50) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_returns_order_id ON returns(order_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id  ON returns(user_id);

-- ----------------------------------------------------------------------------
-- 8. product_categories indexes
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_product_categories_product_id  ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_category_id ON product_categories(category_id);
