-- RLS Policy: Handwerker können Profile von Kunden sehen, deren Leads sie gekauft haben
CREATE POLICY "Contractors can view customer profiles for purchased leads"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM matches m
    JOIN projects p ON m.project_id = p.id
    WHERE m.contractor_id = auth.uid()
    AND m.lead_purchased = true
    AND p.customer_id = profiles.id
  )
);