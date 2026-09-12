CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY, patient_id UUID NOT NULL, doctor_id UUID NOT NULL, symptoms TEXT NOT NULL,
  medical_history TEXT, diagnosis_name VARCHAR(500), diagnosis_code VARCHAR(100), status VARCHAR(30) NOT NULL,
  severity VARCHAR(100), notes TEXT, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO diagnoses (id, patient_id, doctor_id, symptoms, medical_history, diagnosis_name, diagnosis_code, status, severity, notes, created_at) VALUES
('c1b2c3d4-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001','d1e2f3a4-0000-0000-0000-000000000002','Céphalées modérées, fatigue passagère','Hypertension artérielle légère','Hypertension essentielle contrôlée','I10','CONFIRMED','MODERATE','Consultation de suivi : pression artérielle contrôlée.','2026-09-15 10:30:00'),
('c1b2c3d4-0000-0000-0000-000000000002','a1b2c3d4-0000-0000-0000-000000000002','d1e2f3a4-0000-0000-0000-000000000001','Palpitations à l’effort','Antécédent familial cardiovasculaire','Bilan cardiovasculaire à poursuivre','R00.2','SUSPECTED','MEDIUM','Consultation cardiologique : ECG et suivi programmés.','2026-09-18 11:30:00')
ON CONFLICT (id) DO NOTHING;
