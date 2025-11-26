-- Add subcategory_id to projects table to store which subcategory was selected
ALTER TABLE projects ADD COLUMN subcategory_id TEXT REFERENCES service_categories(id);

-- Add index for faster queries
CREATE INDEX idx_projects_subcategory_id ON projects(subcategory_id);