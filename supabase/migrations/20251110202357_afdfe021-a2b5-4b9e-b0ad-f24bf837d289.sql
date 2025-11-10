-- Drop old check constraint that only allowed 5 hardcoded values
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_trade_check;

-- Add new check constraint that allows all gewerke_config IDs
ALTER TABLE projects ADD CONSTRAINT projects_trade_check 
CHECK (trade IN (
  'elektriker', 
  'sanitaer-heizung', 
  'dachdecker', 
  'fassade', 
  'maler'
));