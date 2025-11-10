-- ============================================
-- BAUCONNECT24 - COMPLETE DATABASE MIGRATION
-- Fix all constraints and add comprehensive category system
-- ============================================

-- 1. FIX EXISTING CONSTRAINT ISSUE
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_trade_check;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_gewerk_check;

-- 2. Update column if it exists (handle both old and new schema)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'trade'
    ) THEN
        ALTER TABLE projects RENAME COLUMN trade TO gewerk_id;
    END IF;
END $$;

-- 3. Ensure gewerk_id column exists
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gewerk_id TEXT;

-- 4. Add proper constraint
ALTER TABLE projects 
  ADD CONSTRAINT projects_gewerk_check 
  CHECK (gewerk_id IN ('elektriker', 'sanitar-heizung', 'dachdecker', 'fassade', 'maler'));

-- 5. Create index
DROP INDEX IF EXISTS idx_projects_trade;
DROP INDEX IF EXISTS idx_projects_gewerk_id;
CREATE INDEX idx_projects_gewerk_id ON projects(gewerk_id);

-- ============================================
-- CREATE COMPREHENSIVE CATEGORY SYSTEM
-- ============================================

-- 1. Create categories table with hierarchical structure
CREATE TABLE IF NOT EXISTS service_categories (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES service_categories(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  level INTEGER NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy - everyone can view categories
CREATE POLICY "Anyone can view service categories"
  ON service_categories FOR SELECT
  USING (true);

-- 2. Create category questions table
CREATE TABLE IF NOT EXISTS category_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id TEXT NOT NULL REFERENCES service_categories(id),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN (
    'radio', 'checkbox', 'multiselect', 'number', 'text', 
    'textarea', 'range', 'file-upload', 'date'
  )),
  options JSONB,
  help_text TEXT,
  required BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  conditional_logic JSONB,
  validation_rules JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE category_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Anyone can view category questions"
  ON category_questions FOR SELECT
  USING (true);

-- ============================================
-- INSERT COMPREHENSIVE CATEGORY DATA
-- ============================================

-- ELEKTRIKER MAIN CATEGORY
INSERT INTO service_categories (id, parent_id, name, slug, level, icon, description, sort_order) VALUES
('elektriker', NULL, 'Elektriker / Elektroinstallationen', 'elektriker', 1, 'Zap', 'Steckdosen, PV-Anlagen, Wallboxes, Smart Home', 1);

-- ELEKTRIKER SUBCATEGORIES
INSERT INTO service_categories (id, parent_id, name, slug, level, description, sort_order) VALUES
('elektriker-steckdosen', 'elektriker', 'Steckdosen & Leitungen', 'steckdosen-leitungen', 2, 'Installation und Erneuerung von Steckdosen, Schaltern und Verkabelung', 1),
('elektriker-pv', 'elektriker', 'PV-Anlage / Photovoltaik', 'photovoltaik', 2, 'Solaranlagen, Speicher, Montage und Anmeldung', 2),
('elektriker-wallbox', 'elektriker', 'Wallbox / E-Auto Ladestation', 'wallbox', 2, 'Ladestation für Elektroautos (11kW / 22kW)', 3),
('elektriker-smarthome', 'elektriker', 'Smart Home Installation', 'smart-home', 2, 'Intelligente Haussteuerung, Beleuchtung, Heizung', 4),
('elektriker-zaehler', 'elektriker', 'Zählerschrank erneuern', 'zaehlerschrank', 2, 'Modernisierung und Erweiterung von Verteilern', 5),
('elektriker-beleuchtung', 'elektriker', 'Beleuchtungssysteme', 'beleuchtung', 2, 'LED, Spots, Außenbeleuchtung', 6),
('elektriker-herd', 'elektriker', 'Elektroherd anschließen', 'elektroherd', 2, 'Starkstrom-Anschluss für Herde und Backöfen', 7),
('elektriker-sicherungen', 'elektriker', 'Sicherungen / FI-Schalter', 'sicherungen', 2, 'Austausch und Installation von Sicherungselementen', 8);

-- SANITÄR/HEIZUNG MAIN CATEGORY
INSERT INTO service_categories (id, parent_id, name, slug, level, icon, description, sort_order) VALUES
('sanitar-heizung', NULL, 'Sanitär / Heizung / Lüftung', 'sanitar-heizung', 1, 'Droplet', 'Badezimmer, Heizung, Wärmepumpe, Wasserleitungen', 2);

-- SANITÄR SUBCATEGORIES
INSERT INTO service_categories (id, parent_id, name, slug, level, description, sort_order) VALUES
('sanitar-bad', 'sanitar-heizung', 'Badrenovierung komplett', 'badrenovierung', 2, 'Komplette Badsanierung inkl. Fliesen, Sanitärobjekte', 1),
('sanitar-heizung-tausch', 'sanitar-heizung', 'Heizung erneuern / Wärmepumpe', 'heizung-erneuern', 2, 'Austausch Heizungsanlage, Wärmepumpen-Installation', 2),
('sanitar-leitungen', 'sanitar-heizung', 'Wasserleitungen erneuern', 'wasserleitungen', 2, 'Rohrleitungen, Trinkwasser, Abwasser', 3),
('sanitar-dusche', 'sanitar-heizung', 'Dusche/Badewanne einbauen', 'dusche-badewanne', 2, 'Montage von Duschkabinen, Wannen, bodengleich', 4),
('sanitar-wc', 'sanitar-heizung', 'WC erneuern', 'wc-erneuern', 2, 'Toiletten-Austausch, Hänge-WC, Stand-WC', 5),
('sanitar-waschbecken', 'sanitar-heizung', 'Waschbecken montieren', 'waschbecken', 2, 'Waschtisch, Armaturen, Spiegel', 6),
('sanitar-warmwasser', 'sanitar-heizung', 'Warmwasser (Boiler/Durchlauferhitzer)', 'warmwasser', 2, 'Boiler, Durchlauferhitzer, Speicher', 7),
('sanitar-fussbodenheizung', 'sanitar-heizung', 'Fußbodenheizung', 'fussbodenheizung', 2, 'Installation elektrisch oder Wasser-basiert', 8),
('sanitar-klima', 'sanitar-heizung', 'Klimaanlage', 'klimaanlage', 2, 'Split-Geräte, Multi-Split, Wartung', 9);

-- DACHDECKER MAIN CATEGORY
INSERT INTO service_categories (id, parent_id, name, slug, level, icon, description, sort_order) VALUES
('dachdecker', NULL, 'Dachdecker / Bedachung', 'dachdecker', 1, 'Home', 'Dachsanierung, Ziegel, Flachdach, Dachfenster', 3);

-- DACHDECKER SUBCATEGORIES
INSERT INTO service_categories (id, parent_id, name, slug, level, description, sort_order) VALUES
('dachdecker-sanierung', 'dachdecker', 'Dachsanierung komplett', 'dachsanierung', 2, 'Komplettsanierung inkl. Dämmung und Eindeckung', 1),
('dachdecker-ziegel', 'dachdecker', 'Dachziegel erneuern', 'dachziegel', 2, 'Austausch Ziegel, Betonsteine, Schiefer', 2),
('dachdecker-flachdach', 'dachdecker', 'Flachdach abdichten', 'flachdach', 2, 'Bitumen, EPDM, Begrünung', 3),
('dachdecker-fenster', 'dachdecker', 'Dachfenster einbauen', 'dachfenster', 2, 'Velux, Roto, Dachflächenfenster', 4),
('dachdecker-pv', 'dachdecker', 'PV-Anlage Montage', 'pv-montage', 2, 'Unterkonstruktion für Solarmodule', 5),
('dachdecker-reparatur', 'dachdecker', 'Dachreparatur (Leckage)', 'dachreparatur', 2, 'Notdienst, Undichtigkeit beheben', 6),
('dachdecker-rinne', 'dachdecker', 'Dachrinne erneuern', 'dachrinne', 2, 'Regenrinnen, Fallrohre, Entwässerung', 7);

-- FASSADE MAIN CATEGORY
INSERT INTO service_categories (id, parent_id, name, slug, level, icon, description, sort_order) VALUES
('fassade', NULL, 'Fassade / Außenarbeiten', 'fassade', 1, 'Home', 'Fassadenanstrich, Dämmung, Verputz, Sanierung', 4);

-- FASSADE SUBCATEGORIES
INSERT INTO service_categories (id, parent_id, name, slug, level, description, sort_order) VALUES
('fassade-anstrich', 'fassade', 'Fassadenanstrich', 'fassadenanstrich', 2, 'Außenanstrich, Farbe, Schutz', 1),
('fassade-sanierung', 'fassade', 'Fassadensanierung', 'fassadensanierung', 2, 'Risse, Putz erneuern, Sockel', 2),
('fassade-daemmung', 'fassade', 'WDVS / Dämmung', 'waermedaemmung', 2, 'Wärmedämmverbundsystem, Styropor, Mineralwolle', 3),
('fassade-verputz', 'fassade', 'Verputz erneuern', 'verputz-aussen', 2, 'Außenputz, Edelputz, Strukturputz', 4),
('fassade-holz', 'fassade', 'Holzfassade (Streichen/Lasieren)', 'holzfassade', 2, 'Holzschutz, Lasur, Anstrich', 5),
('fassade-reinigung', 'fassade', 'Fassadenreinigung', 'fassadenreinigung', 2, 'Hochdruckreinigung, Algenenfernung', 6);

-- MALER MAIN CATEGORY
INSERT INTO service_categories (id, parent_id, name, slug, level, icon, description, sort_order) VALUES
('maler', NULL, 'Maler / Innenraumgestaltung', 'maler', 1, 'Paintbrush', 'Wände streichen, Tapezieren, Lackieren', 5);

-- MALER SUBCATEGORIES
INSERT INTO service_categories (id, parent_id, name, slug, level, description, sort_order) VALUES
('maler-streichen', 'maler', 'Wohnung/Zimmer streichen', 'zimmer-streichen', 2, 'Innenwände, Decken, Türen streichen', 1),
('maler-tapezieren', 'maler', 'Tapezieren', 'tapezieren', 2, 'Raufaser, Vliestapete, Mustertapete', 2),
('maler-decke', 'maler', 'Decke streichen', 'decke-streichen', 2, 'Deckenanstrich, Kassettendecke', 3),
('maler-fassade', 'maler', 'Fassade streichen', 'fassade-maler', 2, 'Außenanstrich (Maler)', 4),
('maler-lackieren', 'maler', 'Lackierarbeiten (Türen/Fenster)', 'lackieren', 2, 'Türen, Fenster, Heizkörper lackieren', 5),
('maler-spachteln', 'maler', 'Spachteln & Glätten', 'spachteln', 2, 'Risse ausbessern, Q2-Q4 Verspachtelung', 6),
('maler-dekorativ', 'maler', 'Dekorative Malerarbeiten', 'dekorative-malerarbeiten', 2, 'Wischtechnik, Effekte, Muster', 7)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order;

-- ============================================
-- ADD FOREIGN KEY TO PROJECTS
-- ============================================
ALTER TABLE projects DROP CONSTRAINT IF EXISTS fk_projects_gewerk;
ALTER TABLE projects
  ADD CONSTRAINT fk_projects_gewerk
  FOREIGN KEY (gewerk_id) REFERENCES gewerke_config(id);

COMMENT ON TABLE service_categories IS 'Hierarchical category structure for all services';
COMMENT ON TABLE category_questions IS 'Dynamic funnel questions per category';