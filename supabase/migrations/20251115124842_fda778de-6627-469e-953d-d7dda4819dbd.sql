-- ==========================================
-- NEUE HAUPTKATEGORIE: BAU
-- ==========================================

INSERT INTO service_categories (id, slug, name, parent_id, level, sort_order, icon, description, active)
VALUES ('bau', 'bau', 'Bau / Rohbau / Umbau', NULL, 1, 6, 'Hammer', 'Rohbau, Maurerarbeiten, Umbau, Sanierung', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- BAU - UNTERKATEGORIEN (5 Stück)
-- ==========================================

INSERT INTO service_categories (id, slug, name, parent_id, level, sort_order, icon, description, active)
VALUES 
('bau-rohbau', 'rohbau-maurer-trockenbau-beton', 'Rohbau & Maurerarbeiten & Trockenbau & Betonarbeiten', 'bau', 2, 1, NULL, 'Nach Absprache', true),
('bau-umbau', 'umbau-sanierung-fundament', 'Umbau & Sanierung & Fundament Erstellung', 'bau', 2, 2, NULL, 'Nach Absprache', true),
('bau-estrich', 'estrich-boden-fliesen', 'Estrich & Bodenlegen & Fliesenlegen', 'bau', 2, 3, NULL, 'Nach Absprache', true),
('bau-abbruch', 'abbruch-entsorgung-erd', 'Abbruch & Entsorgungsarbeiten & Erdarbeiten', 'bau', 2, 4, NULL, 'Nach Absprache', true),
('bau-garten', 'bagger-garten-aussen', 'Bagger & Gartenarbeiten & Außenanlagen', 'bau', 2, 5, NULL, 'Nach Absprache', true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- FEHLENDE SANITÄR UNTERKATEGORIEN
-- ==========================================

-- Fehlende Unterkategorien für Sanitär (neue IDs basierend auf User-Anforderungen)
INSERT INTO service_categories (id, slug, name, parent_id, level, sort_order, icon, description, active)
VALUES 
('sanitar-reparatur', 'sanitaer-reparaturen', 'Sanitär-Reparaturen', 'sanitar-heizung', 2, 6, NULL, 'Nach Absprache', true),
('sanitar-gas-wasser', 'gas-wasserleitung', 'Gas/Wasserleitung', 'sanitar-heizung', 2, 9, NULL, 'Erneuern, Verlegen, Neuanschluss', true),
('sanitar-solar', 'solar-thermie', 'Solar/Photovoltaik-Thermie', 'sanitar-heizung', 2, 10, NULL, 'Nach Absprache', true)
ON CONFLICT (id) DO NOTHING;

-- Aktualisiere bestehende Sanitär-Kategorien für bessere Zuordnung
UPDATE service_categories SET name = 'WC / Toilette' WHERE id = 'sanitar-wc';
UPDATE service_categories SET name = 'Waschbecken / Armaturen' WHERE id = 'sanitar-waschbecken';
UPDATE service_categories SET name = 'Dusche / Badewanne' WHERE id = 'sanitar-dusche';
UPDATE service_categories SET name = 'Warmwasser Boiler/Durchlauferhitzer' WHERE id = 'sanitar-warmwasser';

-- ==========================================
-- MALER UNTERKATEGORIE AKTUALISIERUNG
-- ==========================================

UPDATE service_categories SET name = 'Spachtelarbeiten' WHERE id = 'maler-spachteln';
UPDATE service_categories SET name = 'Dekorative Techniken' WHERE id = 'maler-dekorativ';

-- ==========================================
-- LÖSCHE ALLE BESTEHENDEN FRAGEN
-- (um Duplikate zu vermeiden und neu aufzubauen)
-- ==========================================

DELETE FROM category_questions;

-- ==========================================
-- 1️⃣ ELEKTRIKER - ALLE FRAGEN
-- ==========================================

-- 1.1 Steckdosen & Leitungen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-steckdosen', 'Wie viele Steckdosen/Leitungen?', 'number', NULL, true, 1),
('elektriker-steckdosen', 'In welchen Räumen?', 'multiselect', 
'[{"label":"Wohnzimmer","value":"wohnzimmer"},{"label":"Küche","value":"kueche"},{"label":"Schlafzimmer","value":"schlafzimmer"},{"label":"Bad","value":"bad"},{"label":"Büro","value":"buero"},{"label":"Keller","value":"keller"},{"label":"Garage","value":"garage"}]'::jsonb, true, 2),
('elektriker-steckdosen', 'Müssen neue Leitungen verlegt werden?', 'radio', 
'[{"label":"Ja, komplett neu","value":"neu"},{"label":"Teilweise","value":"teilweise"},{"label":"Nein, nur Steckdosen","value":"steckdosen"}]'::jsonb, true, 3);

-- 1.2 PV-Anlage / Photovoltaik
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-pv', 'Welche Leistung soll die PV-Anlage haben?', 'radio', 
'[{"label":"3-5 kWp (Klein)","value":"klein"},{"label":"5-10 kWp (Mittel)","value":"mittel"},{"label":"Über 10 kWp (Groß)","value":"gross"}]'::jsonb, true, 1),
('elektriker-pv', 'Soll ein Stromspeicher installiert werden?', 'radio', 
'[{"label":"Ja, mit Speicher","value":"ja"},{"label":"Nein, ohne Speicher","value":"nein"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 2),
('elektriker-pv', 'Dachtyp?', 'radio', 
'[{"label":"Satteldach","value":"satteldach"},{"label":"Flachdach","value":"flachdach"},{"label":"Pultdach","value":"pultdach"}]'::jsonb, true, 3);

-- 1.3 Wallbox / E-Auto Ladestation
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-wallbox', 'Welche Ladeleistung?', 'radio', 
'[{"label":"3,7 kW","value":"3.7"},{"label":"11 kW","value":"11"},{"label":"22 kW","value":"22"}]'::jsonb, true, 1),
('elektriker-wallbox', 'Wo soll die Wallbox installiert werden?', 'radio', 
'[{"label":"Garage","value":"garage"},{"label":"Carport","value":"carport"},{"label":"Außenwand","value":"aussenwand"},{"label":"Tiefgarage","value":"tiefgarage"}]'::jsonb, true, 2),
('elektriker-wallbox', 'Entfernung zum Zählerschrank?', 'radio', 
'[{"label":"Unter 10m","value":"unter10"},{"label":"10-25m","value":"10-25"},{"label":"Über 25m","value":"ueber25"}]'::jsonb, true, 3),
('elektriker-wallbox', 'Weitere Details', 'textarea', NULL, false, 4);

-- 1.4 Smart Home Installation
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-smarthome', 'Welches System bevorzugen Sie?', 'radio', 
'[{"label":"Noch kein System gewählt","value":"keins"},{"label":"Loxone","value":"loxone"},{"label":"KNX","value":"knx"},{"label":"Homematic","value":"homematic"},{"label":"Anderes System","value":"anderes"}]'::jsonb, true, 1),
('elektriker-smarthome', 'Welche Bereiche sollen smart werden?', 'multiselect', 
'[{"label":"Beleuchtung","value":"licht"},{"label":"Heizung","value":"heizung"},{"label":"Jalousien/Rollläden","value":"jalousien"},{"label":"Sicherheit","value":"sicherheit"},{"label":"Multimedia","value":"multimedia"}]'::jsonb, true, 2);

-- 1.5 Zählerschrank erneuern
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-zaehler', 'Grund für Erneuerung?', 'radio', 
'[{"label":"Erweiterung nötig","value":"erweiterung"},{"label":"Modernisierung","value":"modernisierung"},{"label":"PV-Anlage","value":"pv"},{"label":"Wallbox","value":"wallbox"},{"label":"Defekt","value":"defekt"}]'::jsonb, true, 1),
('elektriker-zaehler', 'Zusätzliche Sicherungsgruppen nötig?', 'radio', 
'[{"label":"Ja","value":"ja"},{"label":"Nein","value":"nein"},{"label":"Weiß nicht","value":"unsicher"}]'::jsonb, false, 2);

-- 1.6 Beleuchtungssysteme
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-beleuchtung', 'Weitere Details', 'textarea', NULL, false, 1);

-- 1.7 Elektroherd anschließen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-herd', 'Weitere Details', 'textarea', NULL, false, 1);

-- 1.8 Sicherungen / FI-Schalter
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('elektriker-sicherungen', 'Weitere Details', 'textarea', NULL, false, 1);

-- ==========================================
-- 2️⃣ SANITÄR-HEIZUNG - ALLE FRAGEN
-- ==========================================

-- 2.1 Badrenovierung komplett
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-bad', 'Badezimmer-Größe?', 'radio', 
'[{"label":"Klein (bis 5m²)","value":"klein"},{"label":"Mittel (5-10m²)","value":"mittel"},{"label":"Groß (über 10m²)","value":"gross"}]'::jsonb, true, 1),
('sanitar-bad', 'Was soll erneuert werden?', 'multiselect', 
'[{"label":"Dusche","value":"dusche"},{"label":"Badewanne","value":"badewanne"},{"label":"WC","value":"wc"},{"label":"Waschbecken","value":"waschbecken"},{"label":"Fliesen","value":"fliesen"},{"label":"Alles","value":"alles"}]'::jsonb, true, 2),
('sanitar-bad', 'Bodengleiche Dusche gewünscht?', 'radio', 
'[{"label":"Ja","value":"ja"},{"label":"Nein","value":"nein"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, false, 3),
('sanitar-bad', 'Weitere Details', 'textarea', NULL, false, 4);

-- 2.2 Fußbodenheizung
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-fussbodenheizung', 'Fläche in m²?', 'number', NULL, true, 1),
('sanitar-fussbodenheizung', 'Anzahl der Räume?', 'number', NULL, true, 2);

-- 2.3 Heizung erneuern / Wärmepumpe
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-heizung-tausch', 'Welcher Heizungstyp?', 'radio', 
'[{"label":"Gas","value":"gas"},{"label":"Öl","value":"oel"},{"label":"Wärmepumpe","value":"waermepumpe"},{"label":"Pellets","value":"pellets"},{"label":"Fernwärme","value":"fernwaerme"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 1),
('sanitar-heizung-tausch', 'Wohnfläche in m²?', 'number', NULL, true, 2),
('sanitar-heizung-tausch', 'Warmwasserbereitung inklusive?', 'radio', 
'[{"label":"Ja, inklusive","value":"ja"},{"label":"Nein, separat","value":"nein"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 3);

-- 2.4 Warmwasser Boiler/Durchlauferhitzer
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-warmwasser', 'Welcher Typ?', 'radio', 
'[{"label":"Boiler","value":"boiler"},{"label":"Durchlauferhitzer","value":"durchlauf"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 1),
('sanitar-warmwasser', 'Anzahl der Zapfstellen?', 'number', NULL, true, 2),
('sanitar-warmwasser', 'Weitere Details', 'textarea', NULL, false, 3);

-- 2.5 WC / Toilette
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-wc', 'Welche WC-Art?', 'radio', 
'[{"label":"Unterputz / Versteckt (in Wand)","value":"unterputz"},{"label":"Aufputz","value":"aufputz"},{"label":"Nach Wunsch","value":"wunsch"}]'::jsonb, false, 1),
('sanitar-wc', 'Weitere Details', 'textarea', NULL, false, 2);

-- 2.6 Sanitär-Reparaturen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-reparatur', 'Beschreibung der Reparatur', 'textarea', NULL, false, 1);

-- 2.7 Waschbecken / Armaturen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-waschbecken', 'Details zur Installation', 'textarea', NULL, false, 1);

-- 2.8 Dusche / Badewanne
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-dusche', 'Was soll installiert werden?', 'textarea', NULL, false, 1);

-- 2.9 Gas/Wasserleitung
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-gas-wasser', 'Art der Arbeit', 'radio', 
'[{"label":"Erneuern","value":"erneuern"},{"label":"Verlegen","value":"verlegen"},{"label":"Neuanschluss","value":"neu"},{"label":"Sonstiges","value":"sonstiges"}]'::jsonb, false, 1),
('sanitar-gas-wasser', 'Weitere Details', 'textarea', NULL, false, 2);

-- 2.10 Solar/Photovoltaik-Thermie
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('sanitar-solar', 'Weitere Details', 'textarea', NULL, false, 1);

-- ==========================================
-- 3️⃣ DACHDECKER - ALLE FRAGEN
-- ==========================================

-- 3.1 Dachsanierung komplett
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('dachdecker-sanierung', 'Dachfläche in m²?', 'number', NULL, true, 1),
('dachdecker-sanierung', 'Was soll gemacht werden?', 'multiselect', 
'[{"label":"Neue Eindeckung","value":"eindeckung"},{"label":"Dämmung","value":"daemmung"},{"label":"Dachstuhl-Reparatur","value":"dachstuhl"},{"label":"Komplettsanierung","value":"komplett"}]'::jsonb, true, 2),
('dachdecker-sanierung', 'Aktueller Zustand?', 'radio', 
'[{"label":"Gut, nur Verschönerung","value":"gut"},{"label":"Mittel, teilweise undicht","value":"mittel"},{"label":"Schlecht, sanierungsbedürftig","value":"schlecht"}]'::jsonb, true, 3);

-- 3.2 Dachziegel erneuern
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('dachdecker-ziegel', 'Welches Material?', 'radio', 
'[{"label":"Tonziegel","value":"ton"},{"label":"Betonsteine","value":"beton"},{"label":"Schiefer","value":"schiefer"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 1),
('dachdecker-ziegel', 'Dachfläche in m²?', 'number', NULL, true, 2);

-- 3.3 Flachdach abdichten
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('dachdecker-flachdach', 'Welche Abdichtung?', 'radio', 
'[{"label":"Bitumen","value":"bitumen"},{"label":"EPDM (Folie)","value":"epdm"},{"label":"Mit Begrünung","value":"begruent"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 1),
('dachdecker-flachdach', 'Fläche in m²?', 'number', NULL, true, 2);

-- 3.4 Dachfenster einbauen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('dachdecker-fenster', 'Details', 'textarea', NULL, false, 1);

-- 3.5 PV-Anlage Montage
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('dachdecker-pv', 'Neuanlage oder Erweiterung?', 'radio', 
'[{"label":"Neuanlage","value":"neu"},{"label":"Erweiterung","value":"erweiterung"}]'::jsonb, false, 1),
('dachdecker-pv', 'Batterie-Speicher gewünscht?', 'radio', 
'[{"label":"Ja, mit Speicher","value":"ja"},{"label":"Nein, ohne Speicher","value":"nein"},{"label":"Weiß noch nicht","value":"unsicher"}]'::jsonb, false, 2),
('dachdecker-pv', 'Leitungen bereits vorhanden?', 'radio', 
'[{"label":"Ja, vorhanden","value":"ja"},{"label":"Nein, müssen verlegt werden","value":"nein"},{"label":"Weiß nicht","value":"unsicher"}]'::jsonb, false, 3);

-- 3.6 Dachreparatur (Leckage)
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('dachdecker-reparatur', 'Dachtyp', 'textarea', NULL, false, 1),
('dachdecker-reparatur', 'Fläche in m²?', 'number', NULL, false, 2),
('dachdecker-reparatur', 'Dringlichkeit?', 'radio', 
'[{"label":"Sehr dringend (sofort)","value":"sofort"},{"label":"Dringend (diese Woche)","value":"woche"},{"label":"Normal (nächste Wochen)","value":"normal"}]'::jsonb, false, 3);

-- 3.7 Dachrinne erneuern
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('dachdecker-rinne', 'Länge der Rinne in Meter?', 'number', NULL, false, 1),
('dachdecker-rinne', 'Dachtyp/Dachform?', 'text', NULL, false, 2),
('dachdecker-rinne', 'Dringlichkeit?', 'radio', 
'[{"label":"Sehr dringend","value":"sofort"},{"label":"Dringend","value":"dringend"},{"label":"Normal","value":"normal"}]'::jsonb, false, 3),
('dachdecker-rinne', 'Weitere Details', 'textarea', NULL, false, 4);

-- ==========================================
-- 4️⃣ FASSADE - ALLE FRAGEN
-- ==========================================

-- 4.1 Fassadenanstrich
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('fassade-anstrich', 'Fassadenfläche in m²?', 'number', NULL, true, 1),
('fassade-anstrich', 'Aktueller Zustand?', 'radio', 
'[{"label":"Gut","value":"gut"},{"label":"Mittel","value":"mittel"},{"label":"Renovierungsbedürftig","value":"schlecht"}]'::jsonb, true, 2),
('fassade-anstrich', 'Anzahl der Stockwerke?', 'number', NULL, true, 3),
('fassade-anstrich', 'Gerüst vorhanden?', 'radio', 
'[{"label":"Ja, vorhanden","value":"ja"},{"label":"Nein, wird benötigt","value":"nein"}]'::jsonb, false, 4);

-- 4.2 Fassadensanierung
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('fassade-sanierung', 'Art der Schäden?', 'multiselect', 
'[{"label":"Risse","value":"risse"},{"label":"Putz bröckelt","value":"putz"},{"label":"Feuchtigkeit","value":"feucht"},{"label":"Algen/Schimmel","value":"algen"},{"label":"Komplettsanierung nötig","value":"komplett"}]'::jsonb, true, 1),
('fassade-sanierung', 'Fläche in m²?', 'number', NULL, true, 2);

-- 4.3 WDVS / Dämmung
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('fassade-daemmung', 'Dämmmaterial?', 'radio', 
'[{"label":"Styropor (EPS)","value":"styropor"},{"label":"Mineralwolle","value":"mineralwolle"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 1),
('fassade-daemmung', 'Dämmstärke?', 'radio', 
'[{"label":"10 cm","value":"10"},{"label":"14 cm","value":"14"},{"label":"16 cm","value":"16"},{"label":"20 cm","value":"20"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 2),
('fassade-daemmung', 'Fläche in m²?', 'number', NULL, true, 3);

-- 4.4 Verputz erneuern
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('fassade-verputz', 'Details', 'textarea', NULL, false, 1);

-- 4.5 Holzfassade (Streichen/Lasieren)
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('fassade-holz', 'Details', 'textarea', NULL, false, 1);

-- 4.6 Fassadenreinigung
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('fassade-reinigung', 'Was soll gereinigt werden?', 'radio', 
'[{"label":"Ganzes Gebäude","value":"ganz"},{"label":"Hälfte des Gebäudes","value":"halb"},{"label":"Teilbereich","value":"teil"}]'::jsonb, false, 1),
('fassade-reinigung', 'Fläche in m²?', 'number', NULL, false, 2);

-- ==========================================
-- 5️⃣ MALER - ALLE FRAGEN
-- ==========================================

-- 5.1 Wohnung/Zimmer streichen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('maler-streichen', 'Anzahl Räume?', 'number', NULL, true, 1),
('maler-streichen', 'Was soll gestrichen werden?', 'multiselect', 
'[{"label":"Wände","value":"waende"},{"label":"Decke","value":"decke"},{"label":"Türen","value":"tueren"},{"label":"Alles","value":"alles"}]'::jsonb, true, 2),
('maler-streichen', 'Fläche in m²?', 'number', NULL, true, 3),
('maler-streichen', 'Möbel abdecken?', 'radio', 
'[{"label":"Ja, durch Handwerker","value":"ja"},{"label":"Nein, mache ich selbst","value":"nein"}]'::jsonb, false, 4);

-- 5.2 Tapezieren
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('maler-tapezieren', 'Tapetentyp?', 'radio', 
'[{"label":"Raufaser","value":"raufaser"},{"label":"Vliestapete","value":"vlies"},{"label":"Mustertapete","value":"muster"},{"label":"Beratung gewünscht","value":"beratung"}]'::jsonb, true, 1),
('maler-tapezieren', 'Anzahl Räume?', 'number', NULL, true, 2),
('maler-tapezieren', 'Fläche in m²?', 'number', NULL, true, 3);

-- 5.3 Decke streichen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('maler-decke', 'Details', 'textarea', NULL, false, 1);

-- 5.4 Fassade streichen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('maler-fassade', 'Fläche in m²?', 'number', NULL, false, 1),
('maler-fassade', 'Gerüst vorhanden?', 'radio', 
'[{"label":"Ja","value":"ja"},{"label":"Nein","value":"nein"}]'::jsonb, false, 2),
('maler-fassade', 'Wo genau?', 'textarea', NULL, false, 3);

-- 5.5 Lackierarbeiten (Türen/Fenster)
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('maler-lackieren', 'Was soll lackiert werden?', 'multiselect', 
'[{"label":"Türen","value":"tueren"},{"label":"Fenster","value":"fenster"},{"label":"Heizkörper","value":"heizkoerper"},{"label":"Treppengeländer","value":"treppe"}]'::jsonb, true, 1),
('maler-lackieren', 'Anzahl Teile?', 'number', NULL, true, 2),
('maler-lackieren', 'Wo?', 'textarea', NULL, false, 3);

-- 5.6 Spachtelarbeiten
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('maler-spachteln', 'Wo soll gespachtelt werden?', 'multiselect', 
'[{"label":"Decke","value":"decke"},{"label":"Wand","value":"wand"},{"label":"Innen","value":"innen"},{"label":"Außen","value":"aussen"}]'::jsonb, false, 1),
('maler-spachteln', 'Fläche in m²?', 'number', NULL, false, 2);

-- 5.7 Dekorative Techniken
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('maler-dekorativ', 'Wo?', 'radio', 
'[{"label":"Innen","value":"innen"},{"label":"Außen","value":"aussen"}]'::jsonb, false, 1),
('maler-dekorativ', 'Fläche in m²?', 'number', NULL, false, 2);

-- ==========================================
-- 6️⃣ BAU - ALLE FRAGEN
-- ==========================================

-- 6.1 Rohbau & Maurerarbeiten & Trockenbau & Betonarbeiten
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('bau-rohbau', 'Projektbeschreibung', 'textarea', NULL, false, 1);

-- 6.2 Umbau & Sanierung & Fundament Erstellung
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('bau-umbau', 'Projektbeschreibung', 'textarea', NULL, false, 1);

-- 6.3 Estrich & Bodenlegen & Fliesenlegen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('bau-estrich', 'Projektbeschreibung', 'textarea', NULL, false, 1);

-- 6.4 Abbruch & Entsorgungsarbeiten & Erdarbeiten
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('bau-abbruch', 'Projektbeschreibung', 'textarea', NULL, false, 1);

-- 6.5 Bagger & Gartenarbeiten & Außenanlagen
INSERT INTO category_questions (category_id, question_text, question_type, options, required, sort_order) VALUES
('bau-garten', 'Projektbeschreibung', 'textarea', NULL, false, 1);