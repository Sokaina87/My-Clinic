CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY, first_name VARCHAR(255) NOT NULL, last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE, phone VARCHAR(255) NOT NULL, birth_date DATE,
  gender VARCHAR(20), address VARCHAR(255), emergency_contact VARCHAR(255)
);
INSERT INTO patients (id, first_name, last_name, email, phone, birth_date, gender, address, emergency_contact) VALUES
('a1b2c3d4-0000-0000-0000-000000000001','Sofia','Martin','sofia.martin@example.com','+33612345678','1992-05-15','FEMALE','15 Rue de la Paix, Paris','Pierre Martin (+33611223344)'),
('a1b2c3d4-0000-0000-0000-000000000002','Thomas','Dubois','thomas.dubois@example.com','+33687654321','1985-11-20','MALE','8 Avenue Victor Hugo, Lyon','Julie Dubois (+33655443322)'),
('a1b2c3d4-0000-0000-0000-000000000003','Marie','Curie','marie.curie@example.com','+33699887766','1990-01-10','FEMALE','4 Boulevard Saint-Germain, Paris','Paul Curie (+33677889900)')
ON CONFLICT (id) DO NOTHING;
