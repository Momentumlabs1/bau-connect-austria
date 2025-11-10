import { 
  Paintbrush, 
  Hammer, 
  Wrench, 
  Zap, 
  Home,
  Package,
  Wallpaper,
  Trash2,
  HelpCircle,
  MoreHorizontal,
  Blocks,
  Square,
  TreePine,
  Droplet,
  Flame,
  Wind,
  DoorOpen,
  Fence,
  Trees,
  Drill,
  Snowflake,
  Sofa,
  Sparkles
} from "lucide-react";

export interface Question {
  id: string;
  type: "multiselect" | "radio" | "text" | "textarea";
  label: string;
  required: boolean;
  placeholder?: string;
  options?: {
    value: string;
    label: string;
    icon?: any;
  }[];
}

export const tradeQuestions: Record<string, Question[]> = {
  "maler": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Welche Malerarbeiten sollen durchgeführt werden?",
      required: true,
      options: [
        { value: "waende_streichen", label: "Wände streichen", icon: Paintbrush },
        { value: "decke_streichen", label: "Decke streichen", icon: Square },
        { value: "tapete_anbringen", label: "Tapete anbringen", icon: Wallpaper },
        { value: "tapete_entfernen", label: "Tapete entfernen", icon: Trash2 },
        { value: "lackierarbeiten", label: "Lackierarbeiten (Türen, Fenster)", icon: Drill },
        { value: "fassade", label: "Fassadenanstrich", icon: Home },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "room_count",
      type: "radio",
      label: "Wie viele Räume sollen gestrichen werden?",
      required: true,
      options: [
        { value: "1", label: "1 Raum" },
        { value: "2-3", label: "2-3 Räume" },
        { value: "4-5", label: "4-5 Räume" },
        { value: "6+", label: "6+ Räume / ganze Wohnung" }
      ]
    },
    {
      id: "room_size",
      type: "radio",
      label: "Wie groß sind die zu streichenden Flächen insgesamt?",
      required: false,
      options: [
        { value: "bis_30", label: "Bis 30 m²" },
        { value: "30-60", label: "30-60 m²" },
        { value: "60-100", label: "60-100 m²" },
        { value: "100+", label: "Über 100 m²" },
        { value: "unbekannt", label: "Weiß ich nicht", icon: HelpCircle }
      ]
    },
    {
      id: "wall_condition",
      type: "radio",
      label: "Wie ist der Zustand der Wände/Decken?",
      required: false,
      options: [
        { value: "gut", label: "Gut (keine Schäden)", icon: Sparkles },
        { value: "leichte_risse", label: "Leichte Risse/Löcher", icon: Wrench },
        { value: "stark_beschaedigt", label: "Stark beschädigt, Spachteln nötig", icon: Hammer },
        { value: "unbekannt", label: "Weiß ich nicht", icon: HelpCircle }
      ]
    },
    {
      id: "furniture",
      type: "radio",
      label: "Sind die Räume möbliert?",
      required: false,
      options: [
        { value: "leer", label: "Nein, Räume sind leer" },
        { value: "teilweise", label: "Teilweise möbliert" },
        { value: "vollmoebliert", label: "Ja, vollständig möbliert" }
      ]
    },
    {
      id: "paint_supply",
      type: "radio",
      label: "Wer besorgt die Farbe?",
      required: false,
      options: [
        { value: "handwerker", label: "Handwerker soll Farbe mitbringen" },
        { value: "kunde", label: "Ich besorge die Farbe selbst" },
        { value: "beratung", label: "Ich brauche Beratung" }
      ]
    },
    {
      id: "ceiling_include",
      type: "radio",
      label: "Soll die Decke mitgestrichen werden?",
      required: false,
      options: [
        { value: "ja", label: "Ja, Decke auch streichen" },
        { value: "nein", label: "Nein, nur Wände" },
        { value: "nur_decke", label: "Nur die Decke" }
      ]
    }
  ],

  "elektriker": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Welche Elektroarbeiten sollen durchgeführt werden?",
      required: true,
      options: [
        { value: "steckdosen", label: "Steckdosen installieren/versetzen", icon: Zap },
        { value: "lichtschalter", label: "Lichtschalter installieren", icon: Zap },
        { value: "lampen", label: "Lampen/Leuchten montieren", icon: Zap },
        { value: "sicherungskasten", label: "Sicherungskasten prüfen/erneuern", icon: Wrench },
        { value: "verkabelung_neu", label: "Neuverkabelung", icon: Zap },
        { value: "reparatur", label: "Reparatur/Fehlersuche", icon: Wrench },
        { value: "fi_schalter", label: "FI-Schutzschalter installieren", icon: Zap },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "scope",
      type: "radio",
      label: "Umfang der Arbeiten?",
      required: true,
      options: [
        { value: "einzeln", label: "Einzelne Steckdose/Schalter" },
        { value: "ein_raum", label: "Ein Raum" },
        { value: "mehrere_raeume", label: "Mehrere Räume (2-4)" },
        { value: "ganze_wohnung", label: "Ganze Wohnung/Haus" }
      ]
    },
    {
      id: "urgency_reason",
      type: "radio",
      label: "Ist es ein Notfall?",
      required: false,
      options: [
        { value: "kein_strom", label: "Ja, kein Strom", icon: Zap },
        { value: "gefahr", label: "Ja, Sicherheitsrisiko (Funken, Kurzschluss)", icon: Flame },
        { value: "normal", label: "Nein, normale Arbeiten" }
      ]
    },
    {
      id: "building_type",
      type: "radio",
      label: "Art des Gebäudes?",
      required: false,
      options: [
        { value: "wohnung", label: "Wohnung/Apartment" },
        { value: "haus", label: "Einfamilienhaus" },
        { value: "gewerbe", label: "Gewerbe/Büro" }
      ]
    },
    {
      id: "installation_count",
      type: "radio",
      label: "Wie viele Steckdosen/Schalter?",
      required: false,
      options: [
        { value: "1-3", label: "1-3 Stück" },
        { value: "4-10", label: "4-10 Stück" },
        { value: "10+", label: "Über 10 Stück" }
      ]
    }
  ],

  "sanitar-heizung": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Welche Sanitär- oder Heizungsarbeiten sollen durchgeführt werden?",
      required: true,
      options: [
        { value: "waschbecken", label: "Waschbecken installieren/reparieren", icon: Droplet },
        { value: "toilette", label: "Toilette installieren/reparieren", icon: Droplet },
        { value: "dusche", label: "Dusche/Badewanne installieren", icon: Droplet },
        { value: "wasserhahn", label: "Wasserhahn reparieren/austauschen", icon: Wrench },
        { value: "rohre", label: "Rohrleitungen verlegen/reparieren", icon: Wrench },
        { value: "verstopfung", label: "Verstopfung beheben", icon: Wrench },
        { value: "heizung_wartung", label: "Heizung warten", icon: Flame },
        { value: "heizung_reparatur", label: "Heizung reparieren", icon: Flame },
        { value: "heizkoerper", label: "Heizkörper installieren/austauschen", icon: Flame },
        { value: "boiler", label: "Boiler/Warmwasserspeicher", icon: Flame },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "area",
      type: "radio",
      label: "In welchem Bereich soll gearbeitet werden?",
      required: true,
      options: [
        { value: "badezimmer", label: "Badezimmer" },
        { value: "wc", label: "WC/Gäste-WC" },
        { value: "kueche", label: "Küche" },
        { value: "heizraum", label: "Heizraum/Keller" },
        { value: "mehrere", label: "Mehrere Bereiche" }
      ]
    },
    {
      id: "urgency_reason",
      type: "radio",
      label: "Ist es ein Notfall?",
      required: false,
      options: [
        { value: "wasserrohrbruch", label: "Ja, Wasserrohrbruch/Leck", icon: Droplet },
        { value: "verstopfung_schwer", label: "Ja, schwere Verstopfung", icon: Wrench },
        { value: "heizung_ausfall", label: "Ja, Heizung ausgefallen (Winter)", icon: Snowflake },
        { value: "normal", label: "Nein, normale Arbeiten" }
      ]
    },
    {
      id: "bathroom_renovation",
      type: "radio",
      label: "Handelt es sich um eine Komplettrenovierung?",
      required: false,
      options: [
        { value: "ja_komplett", label: "Ja, Bad komplett erneuern" },
        { value: "teilweise", label: "Teilweise (einzelne Elemente)" },
        { value: "nein", label: "Nein, nur Reparatur/Wartung" }
      ]
    },
    {
      id: "heating_type",
      type: "radio",
      label: "Welche Art von Heizung haben Sie?",
      required: false,
      options: [
        { value: "gas", label: "Gasheizung" },
        { value: "oel", label: "Ölheizung" },
        { value: "fernwaerme", label: "Fernwärme" },
        { value: "waermepumpe", label: "Wärmepumpe" },
        { value: "strom", label: "Stromheizung" },
        { value: "unbekannt", label: "Weiß ich nicht", icon: HelpCircle }
      ]
    }
  ],

  "dachdecker": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Welche Dacharbeiten sollen durchgeführt werden?",
      required: true,
      options: [
        { value: "neueindeckung", label: "Dach neu eindecken", icon: Home },
        { value: "reparatur", label: "Dachreparatur (Ziegel ersetzen)", icon: Wrench },
        { value: "daemmung", label: "Dachdämmung", icon: Home },
        { value: "dachfenster", label: "Dachfenster einbauen", icon: DoorOpen },
        { value: "dachrinne", label: "Dachrinne reparieren/erneuern", icon: Droplet },
        { value: "inspektion", label: "Dachinspektion", icon: HelpCircle },
        { value: "flachdach", label: "Flachdachabdichtung", icon: Home },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "roof_type",
      type: "radio",
      label: "Um welche Art von Dach handelt es sich?",
      required: true,
      options: [
        { value: "steildach", label: "Steildach (Ziegel, Schindeln)" },
        { value: "flachdach", label: "Flachdach" },
        { value: "satteldach", label: "Satteldach" },
        { value: "walmdach", label: "Walmdach" },
        { value: "unbekannt", label: "Weiß ich nicht", icon: HelpCircle }
      ]
    },
    {
      id: "roof_size",
      type: "radio",
      label: "Wie groß ist die Dachfläche ungefähr?",
      required: false,
      options: [
        { value: "klein", label: "Klein (bis 80 m²)" },
        { value: "mittel", label: "Mittel (80-150 m²)" },
        { value: "gross", label: "Groß (über 150 m²)" },
        { value: "unbekannt", label: "Weiß ich nicht", icon: HelpCircle }
      ]
    },
    {
      id: "damage_type",
      type: "radio",
      label: "Gibt es akute Schäden? (z.B. Undichtigkeit)",
      required: false,
      options: [
        { value: "ja_leck", label: "Ja, Dach ist undicht", icon: Droplet },
        { value: "ja_ziegel", label: "Ja, Ziegel/Schindeln beschädigt", icon: Wrench },
        { value: "nein", label: "Nein, präventive Arbeiten" },
        { value: "unsicher", label: "Ich bin mir nicht sicher", icon: HelpCircle }
      ]
    },
    {
      id: "access",
      type: "radio",
      label: "Ist das Dach gut zugänglich?",
      required: false,
      options: [
        { value: "gut", label: "Ja, gut zugänglich" },
        { value: "schwierig", label: "Schwierig (Gerüst nötig)" },
        { value: "unbekannt", label: "Weiß ich nicht" }
      ]
    }
  ],

  "fassade": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Welche Fassadenarbeiten sollen durchgeführt werden?",
      required: true,
      options: [
        { value: "fassadenanstrich", label: "Fassadenanstrich", icon: Paintbrush },
        { value: "daemmung", label: "Fassadendämmung", icon: Home },
        { value: "verputzen", label: "Fassade verputzen", icon: Blocks },
        { value: "reinigung", label: "Fassadenreinigung", icon: Sparkles },
        { value: "risse", label: "Risse ausbessern", icon: Wrench },
        { value: "balkon", label: "Balkonsanierung", icon: Home },
        { value: "vollwaermeschutz", label: "Vollwärmeschutz", icon: Home },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "building_type",
      type: "radio",
      label: "Um welche Art von Gebäude handelt es sich?",
      required: true,
      options: [
        { value: "einfamilienhaus", label: "Einfamilienhaus" },
        { value: "mehrfamilienhaus", label: "Mehrfamilienhaus" },
        { value: "gewerbe", label: "Gewerbegebäude" },
        { value: "denkmalschutz", label: "Denkmalgeschütztes Gebäude" }
      ]
    },
    {
      id: "facade_size",
      type: "radio",
      label: "Wie groß ist die Fassadenfläche ungefähr?",
      required: false,
      options: [
        { value: "klein", label: "Klein (bis 100 m²)" },
        { value: "mittel", label: "Mittel (100-250 m²)" },
        { value: "gross", label: "Groß (über 250 m²)" },
        { value: "unbekannt", label: "Weiß ich nicht", icon: HelpCircle }
      ]
    },
    {
      id: "facade_condition",
      type: "radio",
      label: "In welchem Zustand ist die Fassade?",
      required: false,
      options: [
        { value: "gut", label: "Gut, nur Anstrich nötig" },
        { value: "risse", label: "Risse vorhanden" },
        { value: "feuchtigkeit", label: "Feuchteschäden" },
        { value: "abgeplatzt", label: "Putz abgeplatzt/beschädigt" },
        { value: "unbekannt", label: "Weiß ich nicht", icon: HelpCircle }
      ]
    },
    {
      id: "scaffold",
      type: "radio",
      label: "Wird ein Gerüst benötigt?",
      required: false,
      options: [
        { value: "ja", label: "Ja, Gerüst erforderlich" },
        { value: "vorhanden", label: "Gerüst ist bereits vorhanden" },
        { value: "nein", label: "Nein, ohne Gerüst möglich" },
        { value: "unbekannt", label: "Weiß ich nicht" }
      ]
    },
    {
      id: "stories",
      type: "radio",
      label: "Wie viele Stockwerke hat das Gebäude?",
      required: false,
      options: [
        { value: "1", label: "1 Stockwerk (Erdgeschoss)" },
        { value: "2", label: "2 Stockwerke" },
        { value: "3-4", label: "3-4 Stockwerke" },
        { value: "5+", label: "5+ Stockwerke" }
      ]
    }
  ],

  "Sonstige": [
    {
      id: "description_required",
      type: "textarea",
      label: "Bitte beschreiben Sie Ihr Projekt",
      required: true,
      placeholder: "Beschreiben Sie möglichst genau, welche Arbeiten durchgeführt werden sollen, welche Materialien benötigt werden, welcher Zeitrahmen geplant ist, etc."
    }
  ]
};

export const commonQuestions: Question[] = [
  {
    id: "timing",
    type: "radio",
    label: "Wann soll die Arbeit erledigt werden?",
    required: true,
    options: [
      { value: "urgent", label: "So schnell wie möglich (dringend)" },
      { value: "consultation", label: "Nach Rücksprache" },
      { value: "2_weeks", label: "Innerhalb von 2 Wochen" },
      { value: "1_month", label: "Innerhalb von 1 Monat" },
      { value: "3_months", label: "Innerhalb von 3 Monaten" },
      { value: "flexible", label: "Flexibel / Noch nicht festgelegt" }
    ]
  }
];
