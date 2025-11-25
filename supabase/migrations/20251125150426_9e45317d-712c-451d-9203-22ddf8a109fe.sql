-- Create promo_codes table for voucher system
CREATE TABLE IF NOT EXISTS public.promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER DEFAULT 0 NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create offers table for contractor offers to projects
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  contractor_id UUID REFERENCES public.contractors(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  message TEXT,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, contractor_id)
);

-- Enable RLS
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for promo_codes
CREATE POLICY "Anyone can view active promo codes"
ON public.promo_codes
FOR SELECT
USING (active = true AND (valid_until IS NULL OR valid_until > NOW()));

-- RLS Policies for offers
CREATE POLICY "Contractors can create offers for own profile"
ON public.offers
FOR INSERT
WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can view own offers"
ON public.offers
FOR SELECT
USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update own offers"
ON public.offers
FOR UPDATE
USING (auth.uid() = contractor_id);

CREATE POLICY "Customers can view offers for own projects"
ON public.offers
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = offers.project_id
  AND projects.customer_id = auth.uid()
));

CREATE POLICY "Customers can update offer status for own projects"
ON public.offers
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.projects
  WHERE projects.id = offers.project_id
  AND projects.customer_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_promo_codes_code ON public.promo_codes(code);
CREATE INDEX idx_promo_codes_active ON public.promo_codes(active);
CREATE INDEX idx_offers_project_id ON public.offers(project_id);
CREATE INDEX idx_offers_contractor_id ON public.offers(contractor_id);
CREATE INDEX idx_offers_status ON public.offers(status);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_promo_codes_updated_at
BEFORE UPDATE ON public.promo_codes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();