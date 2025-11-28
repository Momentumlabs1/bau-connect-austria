-- Allow 'in_progress' status for projects
ALTER TABLE projects 
DROP CONSTRAINT IF EXISTS projects_status_check;

ALTER TABLE projects 
ADD CONSTRAINT projects_status_check 
CHECK (status = ANY (ARRAY['draft'::text, 'open'::text, 'assigned'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]));