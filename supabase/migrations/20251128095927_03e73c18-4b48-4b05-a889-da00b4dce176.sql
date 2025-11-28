-- Constraint für 'bau' Gewerk aktualisieren
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_gewerk_check;

ALTER TABLE projects ADD CONSTRAINT projects_gewerk_check 
CHECK (gewerk_id = ANY (ARRAY[
  'elektriker', 
  'sanitar-heizung', 
  'dachdecker', 
  'fassade', 
  'maler', 
  'bau'
]));