CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(255) NOT NULL,
  specialty VARCHAR(50) NOT NULL,
  address VARCHAR(255),
  experience_years INTEGER,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO doctors (id, first_name, last_name, email, phone, specialty, address, experience_years, active)
VALUES
  ('d1e2f3a4-0000-0000-0000-000000000001', 'Jean', 'Dupont', 'jean.dupont@mediassist.local', '+33140506070', 'CARDIOLOGIST', '22 Avenue Hoche, Paris', 15, TRUE),
  ('d1e2f3a4-0000-0000-0000-000000000002', 'Alice', 'Bernard', 'alice.bernard@mediassist.local', '+33140506071', 'GENERALIST', '10 Rue Royale, Paris', 10, TRUE),
  ('d1e2f3a4-0000-0000-0000-000000000003', 'Marc', 'Moreau', 'marc.moreau@mediassist.local', '+33140506072', 'DERMATOLOGIST', '5 Rue de Rivoli, Paris', 8, TRUE)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, specialty = EXCLUDED.specialty,
  address = EXCLUDED.address, experience_years = EXCLUDED.experience_years, active = EXCLUDED.active;
