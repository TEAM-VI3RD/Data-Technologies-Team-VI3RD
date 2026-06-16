-- Seed admin account
-- Email:    admin@techcycle.nl
-- Wachtwoord: Admin@TechCycle1
INSERT INTO users (email, password_hash, is_admin)
VALUES (
    'admin@techcycle.nl',
    '$2a$10$IZu0.UlbJvOJhetpu/kJLu3bOPktdwSfEhoMz/v1WyVScSANlXxrG',
    true
)
ON CONFLICT (email) DO UPDATE
    SET is_admin = true;
