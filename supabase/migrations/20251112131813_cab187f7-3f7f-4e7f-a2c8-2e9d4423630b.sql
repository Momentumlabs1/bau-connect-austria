-- Storage RLS policies for uploads to work across public buckets
-- Buckets: project-images, contractor-portfolios, profile-images

-- Helper: drop policy if it exists to avoid duplicates on re-run
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read - project-images'
  ) THEN EXECUTE 'DROP POLICY "Public read - project-images" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Upload own folder - project-images'
  ) THEN EXECUTE 'DROP POLICY "Upload own folder - project-images" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Update own files - project-images'
  ) THEN EXECUTE 'DROP POLICY "Update own files - project-images" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Delete own files - project-images'
  ) THEN EXECUTE 'DROP POLICY "Delete own files - project-images" ON storage.objects'; END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read - contractor-portfolios'
  ) THEN EXECUTE 'DROP POLICY "Public read - contractor-portfolios" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Upload own folder - contractor-portfolios'
  ) THEN EXECUTE 'DROP POLICY "Upload own folder - contractor-portfolios" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Update own files - contractor-portfolios'
  ) THEN EXECUTE 'DROP POLICY "Update own files - contractor-portfolios" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Delete own files - contractor-portfolios'
  ) THEN EXECUTE 'DROP POLICY "Delete own files - contractor-portfolios" ON storage.objects'; END IF;

  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read - profile-images'
  ) THEN EXECUTE 'DROP POLICY "Public read - profile-images" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Upload own folder - profile-images'
  ) THEN EXECUTE 'DROP POLICY "Upload own folder - profile-images" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Update own files - profile-images'
  ) THEN EXECUTE 'DROP POLICY "Update own files - profile-images" ON storage.objects'; END IF;
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Delete own files - profile-images'
  ) THEN EXECUTE 'DROP POLICY "Delete own files - profile-images" ON storage.objects'; END IF;
END $$;

-- Public read for images (buckets are marked public)
CREATE POLICY "Public read - project-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Public read - contractor-portfolios"
ON storage.objects FOR SELECT
USING (bucket_id = 'contractor-portfolios');

CREATE POLICY "Public read - profile-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-images');

-- Authenticated users can upload to a folder matching their user id (first segment)
CREATE POLICY "Upload own folder - project-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'project-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Upload own folder - contractor-portfolios"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'contractor-portfolios'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Upload own folder - profile-images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Authenticated users can update/delete their own files (same folder rule)
CREATE POLICY "Update own files - project-images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'project-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Delete own files - project-images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'project-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Update own files - contractor-portfolios"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'contractor-portfolios'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Delete own files - contractor-portfolios"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'contractor-portfolios'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Update own files - profile-images"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Delete own files - profile-images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);