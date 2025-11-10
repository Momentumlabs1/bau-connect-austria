-- ============================================
-- BAUCONNECT24 - Security Fixes
-- Fix RLS and Function Issues
-- ============================================

-- 1. Enable RLS on gewerke_config table
ALTER TABLE gewerke_config ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read gewerke config (it's public reference data)
CREATE POLICY "Anyone can view gewerke config"
  ON gewerke_config FOR SELECT
  USING (true);

-- 2. Fix search_path for calculate_lead_price function
CREATE OR REPLACE FUNCTION calculate_lead_price(
  p_gewerk_id TEXT,
  p_urgency urgency_type,
  p_has_photos BOOLEAN DEFAULT FALSE,
  p_description_length INTEGER DEFAULT 0
)
RETURNS DECIMAL(6,2)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
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
  v_final_price := COALESCE(v_base_price, 0);
  
  -- Add urgency surcharge
  IF p_urgency = 'sofort' THEN
    v_final_price := v_final_price + COALESCE(v_urgent_surcharge, 0);
  END IF;
  
  -- Quality bonus for detailed leads
  IF p_has_photos AND p_description_length > 200 THEN
    v_final_price := v_final_price + 5.00;
  END IF;
  
  RETURN v_final_price;
END;
$$;