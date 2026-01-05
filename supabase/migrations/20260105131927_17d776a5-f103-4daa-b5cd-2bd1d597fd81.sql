CREATE OR REPLACE FUNCTION public.update_contractor_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
    total_reviews = (
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