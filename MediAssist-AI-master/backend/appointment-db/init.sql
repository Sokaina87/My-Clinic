CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY, patient_id UUID NOT NULL, doctor_id UUID NOT NULL,
  appointment_date DATE NOT NULL, appointment_time TIME NOT NULL, status VARCHAR(30) NOT NULL,
  reason VARCHAR(500), notes TEXT
);

-- Lien métier créé uniquement après confirmation du rendez-vous.
CREATE TABLE IF NOT EXISTS doctor_patient_links (
  doctor_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  first_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (doctor_id, patient_id)
);

CREATE OR REPLACE FUNCTION sync_doctor_patient_link() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' THEN
    INSERT INTO doctor_patient_links (doctor_id, patient_id)
    VALUES (NEW.doctor_id, NEW.patient_id)
    ON CONFLICT (doctor_id, patient_id)
    DO UPDATE SET last_confirmed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS appointment_confirms_patient_link ON appointments;
CREATE TRIGGER appointment_confirms_patient_link
AFTER INSERT OR UPDATE OF status ON appointments
FOR EACH ROW EXECUTE FUNCTION sync_doctor_patient_link();
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes) VALUES
('b1b2c3d4-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001','d1e2f3a4-0000-0000-0000-000000000002','2026-09-15','10:00','CONFIRMED','Consultation de suivi','Dossier accessible au Dr Alice Bernard'),
('b1b2c3d4-0000-0000-0000-000000000002','a1b2c3d4-0000-0000-0000-000000000002','d1e2f3a4-0000-0000-0000-000000000001','2026-09-18','11:00','CONFIRMED','Suivi cardiologique','Dossier accessible au Dr Jean Dupont'),
('b1b2c3d4-0000-0000-0000-000000000003','a1b2c3d4-0000-0000-0000-000000000003','d1e2f3a4-0000-0000-0000-000000000003','2026-09-22','14:30','PENDING','Consultation dermatologique','En attente de confirmation')
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctor_patient_links (doctor_id, patient_id)
SELECT doctor_id, patient_id FROM appointments WHERE status = 'CONFIRMED'
ON CONFLICT (doctor_id, patient_id) DO NOTHING;
