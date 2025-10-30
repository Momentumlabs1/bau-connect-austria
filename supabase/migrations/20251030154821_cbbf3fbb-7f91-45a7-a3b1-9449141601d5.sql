-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'contractor', 'admin')),
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create contractors table
CREATE TABLE public.contractors (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  trades TEXT[] NOT NULL DEFAULT '{}',
  postal_codes TEXT[] NOT NULL DEFAULT '{}',
  city TEXT,
  address TEXT,
  description TEXT,
  rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  profile_image_url TEXT,
  portfolio_images TEXT[] DEFAULT '{}',
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  free_leads_remaining INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for contractors
CREATE INDEX idx_contractors_trades ON public.contractors USING GIN(trades);
CREATE INDEX idx_contractors_postal_codes ON public.contractors USING GIN(postal_codes);

-- Enable RLS on contractors
ALTER TABLE public.contractors ENABLE ROW LEVEL SECURITY;

-- Contractors RLS policies
CREATE POLICY "Public can view verified contractors"
  ON public.contractors FOR SELECT
  USING (verified = TRUE);

CREATE POLICY "Contractors can view own profile"
  ON public.contractors FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Contractors can update own profile"
  ON public.contractors FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Contractors can insert own profile"
  ON public.contractors FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  trade TEXT NOT NULL CHECK (trade IN ('Elektriker', 'Sanitär', 'Maler', 'Bau', 'Sonstige')),
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT,
  budget_min INT,
  budget_max INT,
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  preferred_start_date DATE,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'assigned', 'completed', 'cancelled')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for projects
CREATE INDEX idx_projects_trade ON public.projects(trade);
CREATE INDEX idx_projects_postal_code ON public.projects(postal_code);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_customer_id ON public.projects(customer_id);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects RLS policies
CREATE POLICY "Customers can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Contractors can view public open projects"
  ON public.projects FOR SELECT
  USING (visibility = 'public' AND status = 'open');

CREATE POLICY "Customers can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = customer_id);

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES public.contractors(id) ON DELETE CASCADE,
  score INT CHECK (score >= 0 AND score <= 100),
  match_type TEXT NOT NULL CHECK (match_type IN ('suggested', 'applied', 'invited')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'contacted', 'won', 'lost')),
  message TEXT,
  lead_purchased BOOLEAN DEFAULT FALSE,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, contractor_id)
);

-- Enable RLS on matches
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Matches RLS policies
CREATE POLICY "Customers can view matches for own projects"
  ON public.matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = matches.project_id
      AND projects.customer_id = auth.uid()
    )
  );

CREATE POLICY "Contractors can view own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can insert own matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = contractor_id);

CREATE POLICY "Contractors can update own matches"
  ON public.matches FOR UPDATE
  USING (auth.uid() = contractor_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON public.contractors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function and trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();