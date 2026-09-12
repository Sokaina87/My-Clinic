CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS medications (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  active_ingredient VARCHAR(160) NOT NULL,
  form VARCHAR(100) NOT NULL,
  strength VARCHAR(80),
  therapeutic_class VARCHAR(160),
  country_code CHAR(2) NOT NULL DEFAULT 'FR',
  description TEXT,
  search_embedding vector(3),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS medications_name_strength_key
  ON medications (LOWER(name), COALESCE(strength, ''), country_code);
CREATE INDEX IF NOT EXISTS medications_search_embedding_idx
  ON medications USING hnsw (search_embedding vector_l2_ops);

INSERT INTO medications (name, active_ingredient, form, strength, therapeutic_class, description, search_embedding)
VALUES
  ('Doliprane', 'Paracétamol', 'Comprimé', '1000 mg', 'Antalgique / antipyrétique', 'Exemple de médicament présent dans le catalogue de démonstration.', '[0.11,0.24,0.78]'),
  ('Amoxicilline Biogaran', 'Amoxicilline', 'Gélule', '500 mg', 'Antibiotique bêta-lactamine', 'Exemple de médicament présent dans le catalogue de démonstration.', '[0.41,0.82,0.17]'),
  ('Ventoline', 'Salbutamol', 'Solution pour inhalation', '100 µg/dose', 'Bronchodilatateur', 'Exemple de médicament présent dans le catalogue de démonstration.', '[0.73,0.19,0.46]'),
  ('Kardégic', 'Acétylsalicylate de lysine', 'Poudre orale', '75 mg', 'Antiagrégant plaquettaire', 'Exemple de médicament présent dans le catalogue de démonstration.', '[0.29,0.67,0.53]'),
  ('Levothyrox', 'Lévothyroxine sodique', 'Comprimé', '50 µg', 'Hormone thyroïdienne', 'Exemple de médicament présent dans le catalogue de démonstration.', '[0.62,0.34,0.88]')
ON CONFLICT DO NOTHING;
