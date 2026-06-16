-- =============================================================================
-- 008_dcl.sql  –  Database Access Control (DCL)
-- TechCycle Webshop  |  INFDTS01 Data Technologies  |  INF2G  |  2026
--
-- Doel: Minimale rechten per rol (principle of least privilege).
--   • webshop_app   — applicatiegebruiker (de Go-backend)
--   • webshop_admin — beheerdersgebruiker voor directe databasetoegang
--
-- Gebruik:
--   psql -U postgres -d webshop -f 008_dcl.sql
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Rollen aanmaken (IF NOT EXISTS voorkomt fouten bij heruitvoering)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'webshop_app') THEN
        CREATE ROLE webshop_app WITH LOGIN PASSWORD 'change_in_production';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'webshop_admin') THEN
        CREATE ROLE webshop_admin WITH LOGIN PASSWORD 'change_in_production_admin';
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. Rechten applicatierol (webshop_app)
--    Mag SELECT, INSERT, UPDATE, DELETE op alle applicatietabellen.
--    Mag GEEN tabellen aanmaken, verwijderen of structuur wijzigen (geen DDL).
-- ----------------------------------------------------------------------------
GRANT CONNECT ON DATABASE webshop TO webshop_app;
GRANT USAGE   ON SCHEMA  public  TO webshop_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
    users,
    addresses,
    products,
    categories,
    product_categories,
    cart,
    cart_items,
    orders,
    order_items,
    returns
TO webshop_app;

-- Sequences: nodig voor SERIAL / RETURNING id na INSERT
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO webshop_app;

-- Toekomstige tabellen automatisch meegekregen
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO webshop_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT                  ON SEQUENCES TO webshop_app;

-- ----------------------------------------------------------------------------
-- 3. Rechten beheerdersrol (webshop_admin)
--    Volledige toegang voor onderhoud, migraties en rapportages.
--    Mag GEEN superuser-acties uitvoeren (geen CREATEROLE, geen SUPERUSER).
-- ----------------------------------------------------------------------------
GRANT CONNECT ON DATABASE webshop TO webshop_admin;
GRANT USAGE   ON SCHEMA  public  TO webshop_admin;

GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO webshop_admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO webshop_admin;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON TABLES    TO webshop_admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT ALL PRIVILEGES ON SEQUENCES TO webshop_admin;

-- ----------------------------------------------------------------------------
-- 4. Expliciet verbod: webshop_app mag NOOIT DDL uitvoeren
--    (PostgreSQL geeft standaard geen DDL-rechten aan niet-eigenaren;
--     dit blok documenteert die keuze expliciet.)
-- ----------------------------------------------------------------------------
-- REVOKE CREATE ON SCHEMA public FROM webshop_app;  -- al niet toegekend

-- ----------------------------------------------------------------------------
-- 5. Verificatie (optioneel, uitvoeren als psql-script)
-- ----------------------------------------------------------------------------
-- \du webshop_app
-- \du webshop_admin
-- SELECT grantee, table_name, privilege_type
-- FROM   information_schema.role_table_grants
-- WHERE  grantee IN ('webshop_app', 'webshop_admin')
-- ORDER  BY grantee, table_name;
