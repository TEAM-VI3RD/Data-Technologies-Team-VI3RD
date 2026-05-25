-- =============================================================================
-- Webshop Database Schema — MySQL
-- Based on data_techno_ERD
-- =============================================================================

CREATE TABLE IF NOT EXISTS users (
    id            INT          AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE TABLE IF NOT EXISTS categories (
    id   INT          AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT uq_categories_name UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS addresses (
    id           INT          AUTO_INCREMENT PRIMARY KEY,
    user_id      INT          NOT NULL,
    type         VARCHAR(50),
    full_name    VARCHAR(255),
    street       VARCHAR(255),
    house_number VARCHAR(20),
    postal_code  VARCHAR(20),
    city         VARCHAR(100),
    country      VARCHAR(100),
    CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS products (
    id          INT            AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL,
    stock       INT            NOT NULL DEFAULT 0,
    active      BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id                  INT            AUTO_INCREMENT PRIMARY KEY,
    user_id             INT            NOT NULL,
    status              VARCHAR(50)    NOT NULL DEFAULT 'pending',
    order_date          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount        DECIMAL(10, 2),
    shipping_address_id INT,
    billing_address_id  INT,
    CONSTRAINT fk_orders_user             FOREIGN KEY (user_id)             REFERENCES users(id)     ON DELETE RESTRICT,
    CONSTRAINT fk_orders_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES addresses(id) ON DELETE SET NULL,
    CONSTRAINT fk_orders_billing_address  FOREIGN KEY (billing_address_id)  REFERENCES addresses(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id         INT            AUTO_INCREMENT PRIMARY KEY,
    order_id   INT            NOT NULL,
    product_id INT            NOT NULL,
    quantity   INT            NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS product_categories (
    product_id  INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_pc_product  FOREIGN KEY (product_id)  REFERENCES products(id)   ON DELETE CASCADE,
    CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart (
    id         INT      AUTO_INCREMENT PRIMARY KEY,
    user_id    INT      NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         INT      AUTO_INCREMENT PRIMARY KEY,
    cart_id    INT      NOT NULL,
    product_id INT      NOT NULL,
    quantity   INT      NOT NULL,
    added_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_cart    FOREIGN KEY (cart_id)    REFERENCES cart(id)     ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS returns (
    id           INT         AUTO_INCREMENT PRIMARY KEY,
    order_id     INT         NOT NULL,
    user_id      INT         NOT NULL,
    reason       TEXT,
    status       VARCHAR(50),
    requested_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at  DATETIME,
    CONSTRAINT fk_returns_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT,
    CONSTRAINT fk_returns_user  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE RESTRICT
);

-- Indexes
CREATE INDEX idx_addresses_user_id              ON addresses(user_id);
CREATE INDEX idx_orders_user_id                 ON orders(user_id);
CREATE INDEX idx_orders_shipping_address_id     ON orders(shipping_address_id);
CREATE INDEX idx_orders_billing_address_id      ON orders(billing_address_id);
CREATE INDEX idx_order_items_order_id           ON order_items(order_id);
CREATE INDEX idx_order_items_product_id         ON order_items(product_id);
CREATE INDEX idx_product_categories_category_id ON product_categories(category_id);
CREATE INDEX idx_cart_user_id                   ON cart(user_id);
CREATE INDEX idx_cart_items_cart_id             ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id          ON cart_items(product_id);
CREATE INDEX idx_returns_order_id               ON returns(order_id);
CREATE INDEX idx_returns_user_id                ON returns(user_id);

-- Seed data
INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Clothing'),
    ('Books')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO products (name, description, price, stock) VALUES
    ('Laptop',       'High-performance laptop',    999.99, 10),
    ('Smartphone',   '5G capable smartphone',      599.99, 25),
    ('Headphones',   'Noise-cancelling headphones', 199.99, 50),
    ('T-Shirt',      '100% cotton t-shirt',          19.99, 200),
    ('Go Programming', 'Learn Go from scratch',      39.99, 75);

INSERT INTO product_categories (product_id, category_id) VALUES
    (1, 1), (2, 1), (3, 1), (4, 2), (5, 3);
