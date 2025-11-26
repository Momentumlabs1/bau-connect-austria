-- Add funnel_answers JSONB field to projects table to store structured wizard responses
ALTER TABLE projects ADD COLUMN funnel_answers JSONB DEFAULT '{}'::jsonb;

-- Add index for faster JSONB queries
CREATE INDEX idx_projects_funnel_answers ON projects USING gin (funnel_answers);