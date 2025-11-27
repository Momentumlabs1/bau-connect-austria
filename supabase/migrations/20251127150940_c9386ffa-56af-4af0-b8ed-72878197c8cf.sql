-- Füge "Andere Angelegenheiten" Unterkategorien für jedes Gewerk hinzu mit eindeutigen Slugs
INSERT INTO service_categories (id, name, slug, description, level, parent_id, sort_order, active) VALUES
('elektriker-andere', 'Andere Angelegenheiten nach Absprache', 'elektriker-andere-angelegenheiten', 'Sonstige elektrische Arbeiten oder individuelle Anfragen', 2, 'elektriker', 999, true),
('sanitar-heizung-andere', 'Andere Angelegenheiten nach Absprache', 'sanitar-andere-angelegenheiten', 'Sonstige Sanitär- oder Heizungsarbeiten nach individueller Absprache', 2, 'sanitar-heizung', 999, true),
('dachdecker-andere', 'Andere Angelegenheiten nach Absprache', 'dachdecker-andere-angelegenheiten', 'Sonstige Dacharbeiten nach individueller Absprache', 2, 'dachdecker', 999, true),
('fassade-andere', 'Andere Angelegenheiten nach Absprache', 'fassade-andere-angelegenheiten', 'Sonstige Fassadenarbeiten nach individueller Absprache', 2, 'fassade', 999, true),
('maler-andere', 'Andere Angelegenheiten nach Absprache', 'maler-andere-angelegenheiten', 'Sonstige Malerarbeiten nach individueller Absprache', 2, 'maler', 999, true),
('bau-andere', 'Andere Angelegenheiten nach Absprache', 'bau-andere-angelegenheiten', 'Sonstige Bauarbeiten nach individueller Absprache', 2, 'bau', 999, true);

-- Füge generische Fragen für "Andere Angelegenheiten" Kategorien hinzu
INSERT INTO category_questions (category_id, question_text, question_type, required, sort_order, help_text) VALUES
-- Elektriker Andere
('elektriker-andere', 'Beschreiben Sie Ihr Anliegen', 'textarea', true, 1, 'Bitte beschreiben Sie möglichst detailliert, welche elektrischen Arbeiten Sie benötigen'),
('elektriker-andere', 'Weitere Details oder Anforderungen', 'textarea', false, 2, 'Zusätzliche Informationen, die für den Handwerker hilfreich sein könnten'),

-- Sanitär-Heizung Andere
('sanitar-heizung-andere', 'Beschreiben Sie Ihr Anliegen', 'textarea', true, 1, 'Bitte beschreiben Sie möglichst detailliert, welche Sanitär- oder Heizungsarbeiten Sie benötigen'),
('sanitar-heizung-andere', 'Weitere Details oder Anforderungen', 'textarea', false, 2, 'Zusätzliche Informationen, die für den Handwerker hilfreich sein könnten'),

-- Dachdecker Andere
('dachdecker-andere', 'Beschreiben Sie Ihr Anliegen', 'textarea', true, 1, 'Bitte beschreiben Sie möglichst detailliert, welche Dacharbeiten Sie benötigen'),
('dachdecker-andere', 'Weitere Details oder Anforderungen', 'textarea', false, 2, 'Zusätzliche Informationen, die für den Handwerker hilfreich sein könnten'),

-- Fassade Andere
('fassade-andere', 'Beschreiben Sie Ihr Anliegen', 'textarea', true, 1, 'Bitte beschreiben Sie möglichst detailliert, welche Fassadenarbeiten Sie benötigen'),
('fassade-andere', 'Weitere Details oder Anforderungen', 'textarea', false, 2, 'Zusätzliche Informationen, die für den Handwerker hilfreich sein könnten'),

-- Maler Andere
('maler-andere', 'Beschreiben Sie Ihr Anliegen', 'textarea', true, 1, 'Bitte beschreiben Sie möglichst detailliert, welche Malerarbeiten Sie benötigen'),
('maler-andere', 'Weitere Details oder Anforderungen', 'textarea', false, 2, 'Zusätzliche Informationen, die für den Handwerker hilfreich sein könnten'),

-- Bau Andere
('bau-andere', 'Beschreiben Sie Ihr Anliegen', 'textarea', true, 1, 'Bitte beschreiben Sie möglichst detailliert, welche Bauarbeiten Sie benötigen'),
('bau-andere', 'Weitere Details oder Anforderungen', 'textarea', false, 2, 'Zusätzliche Informationen, die für den Handwerker hilfreich sein könnten');