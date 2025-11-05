-- Create Storage Buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('project-images', 'project-images', true),
  ('contractor-portfolios', 'contractor-portfolios', true),
  ('profile-images', 'profile-images', true);

-- RLS for project-images bucket
CREATE POLICY "Anyone can view project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Customers can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS for contractor-portfolios bucket
CREATE POLICY "Anyone can view contractor portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'contractor-portfolios');

CREATE POLICY "Contractors can upload portfolio images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'contractor-portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Contractors can delete own portfolio images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'contractor-portfolios' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS for profile-images bucket
CREATE POLICY "Anyone can view profile images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

CREATE POLICY "Users can upload own profile image"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own profile image"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own profile image"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);