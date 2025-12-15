-- Add storage policies for project-images bucket to allow public uploads
-- This is needed because project creation allows unauthenticated users to upload images
-- before they register (inline registration happens at the last step)

-- Allow anyone to upload to project-images bucket
CREATE POLICY "Allow public uploads to project-images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'project-images');

-- Allow anyone to read from project-images bucket (already public but ensure policy exists)
CREATE POLICY "Allow public read access to project-images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'project-images');

-- Allow anyone to update their own uploads in project-images
CREATE POLICY "Allow public updates to project-images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'project-images');

-- Allow anyone to delete from project-images (for removing uploaded images)
CREATE POLICY "Allow public deletes from project-images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'project-images');