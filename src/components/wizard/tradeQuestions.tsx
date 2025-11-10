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
  "Maler": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "streichen", label: "Wände streichen", icon: Paintbrush },
        { value: "tapete_anbringen", label: "Tapete anbringen", icon: Wallpaper },
        { value: "tapete_entfernen", label: "Alte Tapete entfernen", icon: Trash2 },
        { value: "decke_streichen", label: "Decke streichen", icon: Square },
        { value: "tapete_kaufen", label: "Tapete kaufen", icon: Package },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "rooms",
      type: "radio",
      label: "Wie viele Räume?",
      required: false,
      options: [
        { value: "1", label: "1 Raum" },
        { value: "2-3", label: "2-3 Räume" },
        { value: "4-5", label: "4-5 Räume" },
        { value: "6+", label: "6+ Räume oder ganze Wohnung" }
      ]
    },
    {
      id: "wall_material",
      type: "radio",
      label: "Aus welchem Material bestehen die Wände?",
      required: false,
      options: [
        { value: "tapete", label: "Tapete", icon: Wallpaper },
        { value: "gips", label: "Gips oder Gipskarton", icon: Blocks },
        { value: "beton", label: "Beton", icon: Square },
        { value: "holz", label: "Holz", icon: TreePine },
        { value: "unbekannt", label: "Ich weiß es nicht", icon: HelpCircle }
      ]
    }
  ],

  "Elektriker": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "steckdose", label: "Steckdosen installieren/reparieren", icon: Zap },
        { value: "lichtschalter", label: "Lichtschalter installieren", icon: Zap },
        { value: "beleuchtung", label: "Beleuchtung installieren", icon: Zap },
        { value: "sicherungskasten", label: "Sicherungskasten prüfen/erneuern", icon: Wrench },
        { value: "verkabelung", label: "Verkabelung (Neuinstallation)", icon: Zap },
        { value: "reparatur", label: "Reparatur", icon: Wrench },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "scope",
      type: "radio",
      label: "Umfang der Arbeiten?",
      required: false,
      options: [
        { value: "einzelne", label: "Einzelne Steckdose/Lichtschalter" },
        { value: "raum", label: "Ein Raum" },
        { value: "mehrere_raume", label: "Mehrere Räume" },
        { value: "ganze_wohnung", label: "Ganze Wohnung/Haus" }
      ]
    }
  ],

  "Sanitär": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "waschbecken", label: "Waschbecken installieren/reparieren", icon: Droplet },
        { value: "toilette", label: "Toilette installieren/reparieren", icon: Droplet },
        { value: "dusche", label: "Dusche/Badewanne installieren", icon: Droplet },
        { value: "wasserhahn", label: "Wasserhahn reparieren", icon: Wrench },
        { value: "rohrleitung", label: "Rohrleitungen", icon: Wrench },
        { value: "verstopfung", label: "Verstopfung beheben", icon: Wrench },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "area",
      type: "radio",
      label: "Welcher Bereich?",
      required: false,
      options: [
        { value: "badezimmer", label: "Badezimmer" },
        { value: "kuche", label: "Küche" },
        { value: "wc", label: "WC" },
        { value: "mehrere", label: "Mehrere Bereiche" }
      ]
    }
  ],

  "Heizung": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "wartung", label: "Wartung/Inspektion", icon: Wrench },
        { value: "reparatur", label: "Reparatur", icon: Wrench },
        { value: "neuinstallation", label: "Neuinstallation", icon: Flame },
        { value: "austausch", label: "Heizung austauschen", icon: Flame },
        { value: "entluften", label: "Heizkörper entlüften", icon: Wind },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "heating_type",
      type: "radio",
      label: "Art der Heizung?",
      required: false,
      options: [
        { value: "gas", label: "Gasheizung" },
        { value: "ol", label: "Ölheizung" },
        { value: "fernwarme", label: "Fernwärme" },
        { value: "warmepumpe", label: "Wärmepumpe" },
        { value: "unbekannt", label: "Ich weiß es nicht" }
      ]
    }
  ],

  "Bau": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "neubau", label: "Neubau", icon: Home },
        { value: "umbau", label: "Umbau", icon: Hammer },
        { value: "sanierung", label: "Sanierung", icon: Wrench },
        { value: "mauerarbeiten", label: "Mauerarbeiten", icon: Blocks },
        { value: "verputzen", label: "Verputzen", icon: Blocks },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "scope",
      type: "radio",
      label: "Umfang der Arbeiten?",
      required: false,
      options: [
        { value: "klein", label: "Kleiner Bereich (z.B. ein Raum)" },
        { value: "mittel", label: "Mehrere Räume" },
        { value: "gross", label: "Ganze Wohnung" },
        { value: "haus", label: "Ganzes Haus" }
      ]
    }
  ],

  "Tischler": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "mobel", label: "Möbel anfertigen", icon: Sofa },
        { value: "reparatur", label: "Möbel reparieren", icon: Wrench },
        { value: "einbauschrank", label: "Einbauschrank", icon: Package },
        { value: "turen", label: "Türen anfertigen/montieren", icon: DoorOpen },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    }
  ],

  "Garten": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "rasenpflege", label: "Rasenpflege", icon: Trees },
        { value: "heckenschneiden", label: "Hecke schneiden", icon: Trees },
        { value: "baumpflege", label: "Baumpflege", icon: TreePine },
        { value: "gartengestaltung", label: "Gartengestaltung", icon: Trees },
        { value: "pflasterarbeiten", label: "Pflasterarbeiten", icon: Blocks },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    }
  ],

  "Dachdecker": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "neueindeckung", label: "Dach neu eindecken", icon: Home },
        { value: "reparatur", label: "Dachreparatur", icon: Wrench },
        { value: "dammung", label: "Dachdämmung", icon: Home },
        { value: "inspektion", label: "Inspektion", icon: HelpCircle },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    }
  ],

  "Fensterbau": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "fenster_neu", label: "Neue Fenster einbauen", icon: DoorOpen },
        { value: "fenster_austausch", label: "Fenster austauschen", icon: DoorOpen },
        { value: "turen_neu", label: "Neue Türen einbauen", icon: DoorOpen },
        { value: "reparatur", label: "Reparatur", icon: Wrench },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    }
  ],

  "Zaunbau": [
    {
      id: "work_type",
      type: "multiselect",
      label: "Was soll erledigt werden?",
      required: true,
      options: [
        { value: "neubau", label: "Neuer Zaun", icon: Fence },
        { value: "reparatur", label: "Zaun reparieren", icon: Wrench },
        { value: "tor", label: "Tor installieren", icon: DoorOpen },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    }
  ],

  "Sonstige": [
    {
      id: "description_required",
      type: "textarea",
      label: "Bitte beschreiben Sie Ihr Projekt",
      required: true,
      placeholder: "Beschreiben Sie möglichst genau, welche Arbeiten durchgeführt werden sollen..."
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
