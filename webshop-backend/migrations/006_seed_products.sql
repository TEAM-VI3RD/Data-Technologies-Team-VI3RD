-- =============================================================================
-- 006_seed_products.sql
-- Extra categorieën en producten voor TechCycle.
-- =============================================================================

-- Extra categorieën
INSERT INTO categories (name) VALUES
    ('Laptops'),
    ('Smartphones'),
    ('Tablets'),
    ('Audio'),
    ('Gaming'),
    ('Randapparatuur'),
    ('Opladers & Kabels')
ON CONFLICT (name) DO NOTHING;

-- Producten: laptops
INSERT INTO products (name, description, price, stock, active) VALUES
    ('Apple MacBook Pro 13" (2020)', 'Refurbished MacBook Pro met M1-chip, 8 GB RAM, 256 GB SSD. Uitstekende staat, nieuwe batterij.', 849.00, 8, true),
    ('Dell XPS 13 (2021)', 'Compacte ultrabook, Intel Core i5, 16 GB RAM, 512 GB NVMe SSD. Lichte gebruikssporen.', 649.00, 5, true),
    ('Lenovo ThinkPad X1 Carbon Gen 9', 'Zakelijke ultrabook, Intel Core i7, 16 GB RAM, 512 GB SSD. Klasse A refurbished.', 729.00, 4, true),
    ('HP Spectre x360 14"', 'Convertible laptop, Intel Evo Core i5, 8 GB RAM, 512 GB SSD. Touch + stylus inbegrepen.', 599.00, 6, true),
    ('Asus ZenBook 14', 'AMD Ryzen 5, 8 GB RAM, 512 GB SSD. Lichtgewicht en snel, ideaal voor studenten.', 419.00, 10, true)
ON CONFLICT DO NOTHING;

-- Producten: smartphones
INSERT INTO products (name, description, price, stock, active) VALUES
    ('Apple iPhone 13 128 GB', 'Refurbished iPhone 13, Middernacht, batterijcapaciteit >85%. Inclusief oplaadkabel.', 549.00, 15, true),
    ('Apple iPhone 12 64 GB', 'Refurbished iPhone 12, Zwart. Batterij nieuw vervangen. Klasse A.', 379.00, 20, true),
    ('Samsung Galaxy S22 256 GB', 'Android 14, 8 GB RAM, 50 MP camera. Grafietgrijs, lichte krasjes op achterkant.', 449.00, 12, true),
    ('Samsung Galaxy A53 5G', 'Middenklasse 5G-smartphone, 6 GB RAM, 128 GB opslag. Prima dagelijkse telefoon.', 249.00, 18, true),
    ('Google Pixel 7 128 GB', 'Schone Android-ervaring, 8 GB RAM, uitstekende camera. Obsidian kleur.', 399.00, 7, true),
    ('OnePlus 10 Pro 256 GB', '6,7" AMOLED, Snapdragon 8 Gen 1, 80W snel laden. Vlekkeloos scherm.', 469.00, 5, true)
ON CONFLICT DO NOTHING;

-- Producten: tablets
INSERT INTO products (name, description, price, stock, active) VALUES
    ('Apple iPad Air 5e generatie 64 GB WiFi', 'M1-chip, 10,9" Liquid Retina, Touch ID. Spacegrijs, klasse A.', 549.00, 6, true),
    ('Apple iPad 9e generatie 64 GB WiFi', 'A13 Bionic, 10,2" scherm, ideaal voor studie en entertainment.', 299.00, 10, true),
    ('Samsung Galaxy Tab S8 128 GB', '11" AMOLED 120 Hz, Snapdragon 8 Gen 1, S Pen inbegrepen.', 499.00, 4, true),
    ('Lenovo Tab P11 Pro', '11,5" OLED-scherm, 6 GB RAM, 128 GB, ideaal voor media.', 279.00, 8, true)
ON CONFLICT DO NOTHING;

-- Producten: audio
INSERT INTO products (name, description, price, stock, active) VALUES
    ('Sony WH-1000XM4', 'Over-ear koptelefoon met toonaangevende noise-cancellation. Zwart, 30 uur batterij.', 199.00, 14, true),
    ('Apple AirPods Pro (2e gen)', 'Active Noise Cancellation, Transparency-modus, MagSafe-case.', 179.00, 22, true),
    ('Bose QuietComfort 45', 'Lichte over-ear koptelefoon, comfortabel voor langdurig gebruik.', 189.00, 9, true),
    ('JBL Charge 5', 'Waterdichte Bluetooth-speaker, 20 uur speeltijd, powerbank-functie.', 119.00, 16, true),
    ('Samsung Galaxy Buds2 Pro', 'In-ear earbuds met ANC en Hi-Fi 24-bit audio.', 129.00, 11, true)
ON CONFLICT DO NOTHING;

-- Producten: gaming
INSERT INTO products (name, description, price, stock, active) VALUES
    ('Nintendo Switch OLED', '7" OLED-scherm, 64 GB intern geheugen. Wit, inclusief dock en controllers.', 269.00, 5, true),
    ('PlayStation 4 Pro 1 TB', '4K-gaming console, twee controllers, HDMI-kabel inbegrepen.', 249.00, 3, true),
    ('Xbox Series S 512 GB', 'Compacte next-gen console, All-Digital, 120 fps gaming.', 279.00, 4, true),
    ('SteelSeries Arctis 7 Wireless', 'Draadloze gaming-headset, 24 uur batterij, ClearCast-microfoon.', 89.00, 13, true),
    ('Logitech G Pro X Superlight', 'Ultralicht draadloos gaming-muis, 25K HERO-sensor, 70 g.', 79.00, 20, true)
ON CONFLICT DO NOTHING;

-- Producten: randapparatuur
INSERT INTO products (name, description, price, stock, active) VALUES
    ('LG 27" 4K USB-C monitor', '27UK850-W, IPS-paneel, HDR400, USB-C 60W. Ideaal voor laptop-setup.', 329.00, 5, true),
    ('Dell UltraSharp 24" QHD', 'U2422H, IPS, 2560×1440, USB-C hub. Zakelijke kwaliteitsmonitor.', 279.00, 4, true),
    ('Logitech MX Keys Mini', 'Compact draadloos toetsenbord, backlight, compatibel met Windows/Mac/Linux.', 69.00, 25, true),
    ('Apple Magic Mouse (Space Gray)', 'Draadloze muis met Multi-Touch-oppervlak. Nagenoeg nieuw.', 59.00, 12, true),
    ('Anker USB-C Hub 7-in-1', 'HDMI 4K, 3× USB-A, SD/microSD, USB-C PD 85W. Ideaal voor MacBook/ultrabook.', 39.00, 30, true)
ON CONFLICT DO NOTHING;

-- Producten: opladers & kabels
INSERT INTO products (name, description, price, stock, active) VALUES
    ('Apple 20W USB-C Power Adapter', 'Originele Apple-oplader, geschikt voor iPhone 12/13/14/15 en iPad.', 24.00, 40, true),
    ('Anker 65W GaN USB-C oplader (2 poorten)', 'Compact GaN-technologie, laadt laptop + telefoon tegelijk. PowerPort III.', 34.00, 35, true),
    ('Baseus 100W USB-C naar USB-C kabel (2 m)', 'Snelladen + dataoverdracht 40 Gbps, gevlochten nylon mantel.', 14.00, 50, true),
    ('Samsung 25W USB-C oplader', 'Originele Samsung Super Fast Charging-oplader, zonder kabel.', 18.00, 28, true)
ON CONFLICT DO NOTHING;

-- Koppel producten aan categorieën via junction table
-- Haal eerst de IDs op met subqueries zodat de insert robuust blijft
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE p.name IN (
    'Apple MacBook Pro 13" (2020)',
    'Dell XPS 13 (2021)',
    'Lenovo ThinkPad X1 Carbon Gen 9',
    'HP Spectre x360 14"',
    'Asus ZenBook 14'
)
AND c.name = 'Laptops'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE p.name IN (
    'Apple iPhone 13 128 GB',
    'Apple iPhone 12 64 GB',
    'Samsung Galaxy S22 256 GB',
    'Samsung Galaxy A53 5G',
    'Google Pixel 7 128 GB',
    'OnePlus 10 Pro 256 GB'
)
AND c.name = 'Smartphones'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE p.name IN (
    'Apple iPad Air 5e generatie 64 GB WiFi',
    'Apple iPad 9e generatie 64 GB WiFi',
    'Samsung Galaxy Tab S8 128 GB',
    'Lenovo Tab P11 Pro'
)
AND c.name = 'Tablets'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE p.name IN (
    'Sony WH-1000XM4',
    'Apple AirPods Pro (2e gen)',
    'Bose QuietComfort 45',
    'JBL Charge 5',
    'Samsung Galaxy Buds2 Pro'
)
AND c.name = 'Audio'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE p.name IN (
    'Nintendo Switch OLED',
    'PlayStation 4 Pro 1 TB',
    'Xbox Series S 512 GB',
    'SteelSeries Arctis 7 Wireless',
    'Logitech G Pro X Superlight'
)
AND c.name = 'Gaming'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE p.name IN (
    'LG 27" 4K USB-C monitor',
    'Dell UltraSharp 24" QHD',
    'Logitech MX Keys Mini',
    'Apple Magic Mouse (Space Gray)',
    'Anker USB-C Hub 7-in-1'
)
AND c.name = 'Randapparatuur'
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE p.name IN (
    'Apple 20W USB-C Power Adapter',
    'Anker 65W GaN USB-C oplader (2 poorten)',
    'Baseus 100W USB-C naar USB-C kabel (2 m)',
    'Samsung 25W USB-C oplader'
)
AND c.name = 'Opladers & Kabels'
ON CONFLICT DO NOTHING;

-- Koppel ook aan de bestaande 'Electronics'-categorie voor brede vindbaarheid
INSERT INTO product_categories (product_id, category_id)
SELECT p.id, c.id
FROM products p, categories c
WHERE c.name = 'Electronics'
  AND p.name NOT IN ('Laptop', 'Smartphone', 'Headphones', 'T-Shirt', 'Go Programming')
ON CONFLICT DO NOTHING;
