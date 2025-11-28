-- Add terms acceptance and confirmation timestamp to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;