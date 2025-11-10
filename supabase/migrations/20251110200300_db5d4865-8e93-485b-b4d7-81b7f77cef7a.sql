-- ============================================
-- BAUCONNECT24 - Fix remaining function
-- ============================================

-- Fix update_contractor_rating function
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