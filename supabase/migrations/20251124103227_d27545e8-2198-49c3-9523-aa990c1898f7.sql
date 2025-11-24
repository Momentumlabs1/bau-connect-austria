-- Create lead_purchases table for tracking Stripe payments
CREATE TABLE public.lead_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.lead_purchases ENABLE ROW LEVEL SECURITY;

-- Contractors can view their own purchases
CREATE POLICY "Contractors can view own purchases"
ON public.lead_purchases
FOR SELECT
USING (auth.uid() = user_id);

-- Contractors can insert their own purchases
CREATE POLICY "Contractors can insert own purchases"
ON public.lead_purchases
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_lead_purchases_user_id ON public.lead_purchases(user_id);
CREATE INDEX idx_lead_purchases_lead_id ON public.lead_purchases(lead_id);
CREATE INDEX idx_lead_purchases_stripe_id ON public.lead_purchases(stripe_payment_intent_id);