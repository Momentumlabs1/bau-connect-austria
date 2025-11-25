-- Add 'bau' gewerk to gewerke_config
INSERT INTO gewerke_config (id, label, base_price, urgent_surcharge, min_project_value, keywords, icon, description)
VALUES (
  'bau',
  'Bau / Rohbau / Umbau',
  25.00,
  10.00,
  1500,
  ARRAY['bau', 'rohbau', 'umbau', 'sanierung', 'estrich', 'abbruch', 'maurer', 'garten'],
  'Hammer',
  'Bauarbeiten, Rohbau, Umbau und Sanierung'
)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  base_price = EXCLUDED.base_price,
  urgent_surcharge = EXCLUDED.urgent_surcharge,
  min_project_value = EXCLUDED.min_project_value,
  keywords = EXCLUDED.keywords,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description;