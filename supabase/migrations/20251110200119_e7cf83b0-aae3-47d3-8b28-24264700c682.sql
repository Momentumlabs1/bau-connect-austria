-- ============================================
-- BAUCONNECT24 - COMPLETE DATABASE SCHEMA
-- Phase 1: Foundation & Core Tables
-- ============================================

-- 1. CREATE ENUMS
CREATE TYPE gewerk_type AS ENUM (
  'elektriker',
  'sanitar-heizung', 
  'dachdecker',
  'fassade',
  'maler'
);

CREATE TYPE urgency_type AS ENUM (
  'sofort',
  'normal',
  'flexibel'
);

CREATE TYPE transaction_type AS ENUM (
  'LEAD_PURCHASE',
  'WALLET_RECHARGE',
  'REFUND',
  'ADJUSTMENT'
);

CREATE TYPE refund_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

CREATE TYPE handwerker_status AS ENUM (
  'REGISTERED',
  'DOCUMENTS_UPLOADED',
  'UNDER_REVIEW',
  'APPROVED',
  'SUSPENDED',
  'INCOMPLETE'
);

-- 2. EXTEND CONTRACTORS TABLE
ALTER TABLE contractors 
  ADD COLUMN IF NOT EXISTS service_radius INTEGER DEFAULT 50,
  ADD COLUMN IF NOT EXISTS min_project_value INTEGER DEFAULT 500,
  ADD COLUMN IF NOT EXISTS accepts_urgent BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS capacity_per_month INTEGER,
  ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS auto_recharge_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS auto_recharge_threshold DECIMAL(10,2) DEFAULT 100.00,
  ADD COLUMN IF NOT EXISTS auto_recharge_amount DECIMAL(10,2) DEFAULT 500.00,
  ADD COLUMN IF NOT EXISTS leads_bought INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS leads_won INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_response_time_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS handwerker_status handwerker_status DEFAULT 'REGISTERED',
  ADD COLUMN IF NOT EXISTS firmenname TEXT,
  ADD COLUMN IF NOT EXISTS uid_nummer TEXT,
  ADD COLUMN IF NOT EXISTS rechtsform TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS team_size INTEGER,
  ADD COLUMN IF NOT EXISTS gewerbeschein_url TEXT,
  ADD COLUMN IF NOT EXISTS versicherung_url TEXT,
  ADD COLUMN IF NOT EXISTS zertifikate_urls TEXT[];

-- Update trades column to use new structure
ALTER TABLE contractors 
  ALTER COLUMN trades TYPE TEXT[] USING trades::TEXT[];

-- 3. EXTEND PROJECTS TABLE (becomes LEADS)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS urgency urgency_type DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS assigned_handwerker UUID[],
  ADD COLUMN IF NOT EXISTS base_price DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS final_price DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS spam_score DECIMAL(3,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS quality_checks JSONB,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS projekt_typ TEXT,
  ADD COLUMN IF NOT EXISTS estimated_value INTEGER,
  ADD COLUMN IF NOT EXISTS fotos TEXT[];

-- Set default expiration (24 hours from creation)
UPDATE projects 
SET expires_at = created_at + INTERVAL '24 hours'
WHERE expires_at IS NULL;

-- 4. CREATE TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handwerker_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  type transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  balance_after DECIMAL(10,2) NOT NULL,
  
  description TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Contractors can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = handwerker_id);

CREATE POLICY "Contractors can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = handwerker_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_handwerker ON transactions(handwerker_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- 5. CREATE REFUND_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handwerker_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  
  reason TEXT NOT NULL,
  proof_urls TEXT[],
  requested_amount DECIMAL(10,2) NOT NULL,
  
  status refund_status DEFAULT 'PENDING',
  admin_notes TEXT,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Contractors can view own refund requests"
  ON refund_requests FOR SELECT
  USING (auth.uid() = handwerker_id);

CREATE POLICY "Contractors can create own refund requests"
  ON refund_requests FOR INSERT
  WITH CHECK (auth.uid() = handwerker_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_refund_requests_handwerker ON refund_requests(handwerker_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);

-- 6. CREATE REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  handwerker_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  
  reviewer_type TEXT NOT NULL CHECK (reviewer_type IN ('CUSTOMER', 'HANDWERKER')),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews for own projects"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_type = 'CUSTOMER' AND
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = lead_id 
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can create reviews for purchased leads"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_type = 'HANDWERKER' AND
    auth.uid() = handwerker_id
  );

-- Index
CREATE INDEX IF NOT EXISTS idx_reviews_handwerker ON reviews(handwerker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_lead ON reviews(lead_id);

-- 7. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  handwerker_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  channels TEXT[],
  sent_via TEXT[],
  
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Contractors can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = handwerker_id);

CREATE POLICY "Contractors can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = handwerker_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_notifications_handwerker ON notifications(handwerker_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read, created_at DESC);

-- 8. CREATE GEWERKE REFERENCE TABLE
CREATE TABLE IF NOT EXISTS gewerke_config (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  base_price DECIMAL(6,2) NOT NULL,
  urgent_surcharge DECIMAL(6,2) NOT NULL,
  min_project_value INTEGER NOT NULL,
  keywords TEXT[] NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the 5 main gewerke
INSERT INTO gewerke_config (id, label, base_price, urgent_surcharge, min_project_value, keywords, icon, description) VALUES
(
  'elektriker',
  'Elektriker / Elektroinstallationen',
  35.00,
  10.00,
  300,
  ARRAY['photovoltaik', 'pv-anlage', 'wallbox', 'e-auto', 'ladestation', 'steckdosen', 'strom', 'elektrik', 'beleuchtung', 'led', 'smart-home', 'zählerkasten', 'sicherung', 'elektroherd', 'kabel', 'verkabelung'],
  'Zap',
  'Steckdosen & Leitungen, PV-Installation, Wallbox, Smart Home, Beleuchtungssysteme'
),
(
  'sanitar-heizung',
  'Sanitär / Heizung / Lüftung',
  45.00,
  15.00,
  500,
  ARRAY['bad', 'badezimmer', 'sanitär', 'heizung', 'wärmepumpe', 'warmwasser', 'boiler', 'durchlauferhitzer', 'wc', 'toilette', 'dusche', 'badewanne', 'waschbecken', 'wasserleitungen', 'rohr', 'heizungstausch', 'fußbodenheizung', 'klima', 'lüftung', 'klimaanlage'],
  'Droplet',
  'Badrenovierung, Heizungstausch, Wärmepumpe, Wasserleitungen, Klimaanlage'
),
(
  'dachdecker',
  'Dachdecker / Bedachung',
  50.00,
  20.00,
  1000,
  ARRAY['dach', 'dachdecker', 'dachziegel', 'dachsanierung', 'dachdeckung', 'flachdach', 'steildach', 'dachfenster', 'photovoltaik-montage', 'pv-dach', 'dachrinne', 'entwässerung', 'dachstuhl', 'dachdämmung', 'undicht', 'dachreparatur'],
  'Home',
  'Dachsanierung, Dachziegel, Flachdach-Abdichtung, Dachfenster, PV-Montage'
),
(
  'fassade',
  'Fassade / Außenarbeiten',
  40.00,
  15.00,
  800,
  ARRAY['fassade', 'außenwand', 'verputz', 'außenputz', 'dämmung', 'wärmedämmung', 'wdvs', 'fassadenanstrich', 'fassadensanierung', 'außenarbeiten', 'verkleidung', 'holzfassade', 'sockel', 'schimmel-außen'],
  'Home',
  'Fassadensanierung, Fassadenanstrich, Wärmedämmung, Verputzarbeiten außen'
),
(
  'maler',
  'Maler / Innenraumgestaltung',
  20.00,
  5.00,
  250,
  ARRAY['maler', 'streichen', 'malen', 'anstrich', 'wände', 'tapezieren', 'tapete', 'lackieren', 'lackierung', 'schimmel', 'spachteln', 'verputz-innen', 'innenwände', 'decke-streichen', 'boden-versiegelung'],
  'Paintbrush',
  'Innenwände streichen, Tapezieren, Lackierarbeiten, Schimmelentfernung'
)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  base_price = EXCLUDED.base_price,
  urgent_surcharge = EXCLUDED.urgent_surcharge,
  min_project_value = EXCLUDED.min_project_value,
  keywords = EXCLUDED.keywords,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;

-- 9. CREATE HELPER FUNCTIONS

-- Function to calculate lead price
CREATE OR REPLACE FUNCTION calculate_lead_price(
  p_gewerk_id TEXT,
  p_urgency urgency_type,
  p_has_photos BOOLEAN DEFAULT FALSE,
  p_description_length INTEGER DEFAULT 0
)
RETURNS DECIMAL(6,2)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_base_price DECIMAL(6,2);
  v_urgent_surcharge DECIMAL(6,2);
  v_final_price DECIMAL(6,2);
BEGIN
  -- Get base price and surcharge from config
  SELECT base_price, urgent_surcharge
  INTO v_base_price, v_urgent_surcharge
  FROM gewerke_config
  WHERE id = p_gewerk_id;
  
  -- Start with base price
  v_final_price := v_base_price;
  
  -- Add urgency surcharge
  IF p_urgency = 'sofort' THEN
    v_final_price := v_final_price + v_urgent_surcharge;
  END IF;
  
  -- Quality bonus for detailed leads
  IF p_has_photos AND p_description_length > 200 THEN
    v_final_price := v_final_price + 5.00;
  END IF;
  
  RETURN v_final_price;
END;
$$;

-- Function to update contractor stats after lead purchase
CREATE OR REPLACE FUNCTION update_contractor_stats_on_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'LEAD_PURCHASE' THEN
    -- Increment leads_bought
    UPDATE contractors
    SET 
      leads_bought = leads_bought + 1,
      wallet_balance = NEW.balance_after,
      updated_at = NOW()
    WHERE id = NEW.handwerker_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for stats update
DROP TRIGGER IF EXISTS trigger_update_contractor_stats ON transactions;
CREATE TRIGGER trigger_update_contractor_stats
  AFTER INSERT ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_contractor_stats_on_purchase();

-- Function to update contractor rating from reviews
CREATE OR REPLACE FUNCTION update_contractor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE contractors
  SET 
    rating = (
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM reviews
      WHERE handwerker_id = NEW.handwerker_id
      AND reviewer_type = 'CUSTOMER'
    ),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE handwerker_id = NEW.handwerker_id
      AND reviewer_type = 'CUSTOMER'
    ),
    updated_at = NOW()
  WHERE id = NEW.handwerker_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rating update
DROP TRIGGER IF EXISTS trigger_update_contractor_rating ON reviews;
CREATE TRIGGER trigger_update_contractor_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_contractor_rating();

-- 10. UPDATE EXISTING TRIGGERS
-- Update the updated_at trigger for contractors
DROP TRIGGER IF EXISTS update_contractors_updated_at ON contractors;
CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update the updated_at trigger for projects
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();