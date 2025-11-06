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
  Image as ImageIcon,
  Blocks,
  Square,
  TreePine
} from "lucide-react";

export interface Question {
  id: string;
  type: "multiselect" | "radio" | "text";
  label: string;
  required: boolean;
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
        { value: "tapete_kaufen", label: "Tapete kaufen", icon: Package },
        { value: "tapete_anbringen", label: "Tapete anbringen", icon: Wallpaper },
        { value: "tapete_entfernen", label: "Alte Tapete entfernen", icon: Trash2 },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "wallpaper_type",
      type: "radio",
      label: "Welche Art von Tapete benötigen Sie?",
      required: false,
      options: [
        { value: "vliestapete", label: "Vliestapete" },
        { value: "raufasertapete", label: "Raufasertapete" },
        { value: "glasfasertapete", label: "Glasfasertapete" },
        { value: "papiertapete", label: "Papiertapete" },
        { value: "fototapete", label: "Fototapete" },
        { value: "strukturprofiltapete", label: "Strukturprofiltapete" },
        { value: "beratung", label: "Beratung gewünscht" },
        { value: "sonstiges", label: "Sonstiges" }
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
        { value: "trockenbau", label: "Trockenbauwand", icon: Square },
        { value: "beton", label: "Beton", icon: Square },
        { value: "holz", label: "Holz", icon: TreePine },
        { value: "unbekannt", label: "Ich weiß es nicht", icon: HelpCircle },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
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
        { value: "installation", label: "Neuinstallation", icon: Zap },
        { value: "repair", label: "Reparatur", icon: Wrench },
        { value: "inspection", label: "Überprüfung", icon: HelpCircle },
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "scope",
      type: "radio",
      label: "Umfang der Arbeiten?",
      required: false,
      options: [
        { value: "einzelne_steckdose", label: "Einzelne Steckdose/Lichtschalter" },
        { value: "mehrere_raume", label: "Mehrere Räume" },
        { value: "ganze_wohnung", label: "Ganze Wohnung/Haus" },
        { value: "beratung", label: "Beratung gewünscht" }
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
        { value: "installation", label: "Neuinstallation", icon: Wrench },
        { value: "repair", label: "Reparatur", icon: Hammer },
        { value: "renovation", label: "Sanierung", icon: Home },
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
        { value: "mehrere", label: "Mehrere Bereiche" },
        { value: "sonstiges", label: "Sonstiges" }
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
        { value: "sonstiges", label: "Sonstiges", icon: MoreHorizontal }
      ]
    },
    {
      id: "scope",
      type: "radio",
      label: "Umfang der Arbeiten?",
      required: false,
      options: [
        { value: "kleiner_bereich", label: "Kleiner Bereich (z.B. ein Raum)" },
        { value: "mehrere_raume", label: "Mehrere Räume" },
        { value: "ganze_wohnung", label: "Ganze Wohnung" },
        { value: "ganzes_haus", label: "Ganzes Haus" },
        { value: "beratung", label: "Beratung gewünscht" }
      ]
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
      { value: "urgent", label: "Dringend" },
      { value: "consultation", label: "Nach Rücksprache" },
      { value: "2_weeks", label: "Innerhalb von 2 Wochen" },
      { value: "1_month", label: "Innerhalb von 1 Monat" },
      { value: "3_months", label: "Innerhalb weniger Monate" }
    ]
  }
];