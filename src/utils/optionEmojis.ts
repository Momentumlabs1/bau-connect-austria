// Comprehensive emoji mapping for funnel options
// Maps option values/labels to appropriate emojis

const emojiMap: Record<string, string> = {
  // === Generic Yes/No/Maybe ===
  "ja": "✅",
  "nein": "❌",
  "weiß nicht": "❓",
  "weiß ich nicht": "❓",
  "unbekannt": "❓",
  "beratung gewünscht": "💬",
  "beratung": "💬",
  "unsicher": "🤔",
  "flexibel": "🟢",
  "dringend": "🔴",
  "bald": "🟡",
  
  // === Sizes ===
  "klein": "🔹",
  "mittel": "🔸",
  "groß": "⬛",
  "3-5 kwp (klein)": "🔹",
  "5-10 kwp (mittel)": "🔸",
  "über 10 kwp (groß)": "⬛",
  
  // === Numbers/Quantities ===
  "1": "1️⃣",
  "2": "2️⃣",
  "3": "3️⃣",
  "1-2": "🔢",
  "1-3": "🔢",
  "2-3": "🔢",
  "3-4": "🔢",
  "4-5": "🔢",
  "4-6": "🔢",
  "4-10": "🔢",
  "5+": "➕",
  "6+": "➕",
  "10+": "➕",
  "1 raum": "1️⃣",
  "2-3 räume": "🏠",
  "4-5 räume": "🏢",
  "6+ räume / ganze wohnung": "🏠",
  
  // === Room/Area Sizes ===
  "bis 30 m²": "📐",
  "30-60 m²": "📐",
  "60-100 m²": "📐",
  "über 100 m²": "📐",
  "bis 80 m²": "📐",
  "80-150 m²": "📐",
  "über 150 m²": "📐",
  "bis 100 m²": "📐",
  "100-250 m²": "📐",
  "über 250 m²": "📐",
  
  // === Elektriker ===
  "steckdosen & leitungen": "🔌",
  "steckdosen installieren/versetzen": "🔌",
  "steckdosen": "🔌",
  "lichtschalter": "💡",
  "lichtschalter installieren": "💡",
  "lampen": "💡",
  "lampen/leuchten montieren": "💡",
  "beleuchtung": "💡",
  "pv-anlage": "☀️",
  "für pv-anlage": "☀️",
  "wallbox": "🔋",
  "für wallbox": "🔋",
  "smart home": "🏠",
  "zählerschrank": "📊",
  "elektroherd": "🍳",
  "elektroherd anschluss": "🍳",
  "herd anschließen": "🍳",
  "sicherungen": "⚡",
  "fi-schutzschalter": "⚡",
  "fi-schutzschalter installieren": "⚡",
  "sicherungskasten": "📦",
  "sicherungskasten prüfen/erneuern": "📦",
  "verkabelung": "🔧",
  "neuverkabelung": "🔧",
  "reparatur": "🔧",
  "reparatur/fehlersuche": "🔧",
  "defekt": "⚠️",
  "modernisierung": "🔄",
  "erweiterung": "➕",
  "erweiterung (pv/wallbox)": "➕",
  
  // === Sanitär/Heizung ===
  "waschbecken": "🚰",
  "waschbecken installieren/reparieren": "🚰",
  "toilette": "🚽",
  "toilette installieren/reparieren": "🚽",
  "wc": "🚽",
  "gäste-wc": "🚽",
  "dusche": "🚿",
  "dusche/badewanne installieren": "🚿",
  "badewanne": "🛁",
  "badezimmer": "🛁",
  "wasserhahn": "🚰",
  "wasserhahn reparieren/austauschen": "🚰",
  "rohre": "🔧",
  "rohrleitungen": "🔧",
  "rohrleitungen verlegen/reparieren": "🔧",
  "verstopfung": "🔧",
  "verstopfung beheben": "🔧",
  "heizung": "🔥",
  "heizung warten": "🔥",
  "heizung reparieren": "🔥",
  "heizung wartung": "🔥",
  "heizung reparatur": "🔥",
  "heizkörper": "🌡️",
  "heizkörper installieren/austauschen": "🌡️",
  "boiler": "🔥",
  "boiler/warmwasserspeicher": "🔥",
  "warmwasser": "🔥",
  "gasheizung": "🔥",
  "gas": "🔥",
  "ölheizung": "🛢️",
  "öl": "🛢️",
  "fernwärme": "🏢",
  "wärmepumpe": "♻️",
  "stromheizung": "⚡",
  "strom": "⚡",
  "küche": "🍳",
  "heizraum": "🏠",
  "heizraum/keller": "🏠",
  "keller": "🏠",
  
  // === Speicher/Batterie ===
  "ja, mit speicher": "🔋",
  "nein, ohne speicher": "❌",
  "stromspeicher": "🔋",
  
  // === Dachtypen ===
  "steildach": "🏠",
  "steildach (ziegel, schindeln)": "🏠",
  "flachdach": "🏢",
  "satteldach": "🏠",
  "walmdach": "🏠",
  "schrägdach": "🏠",
  "pultdach": "🏠",
  
  // === Dachdecker ===
  "dach neu eindecken": "🏠",
  "neueindeckung": "🏠",
  "dachreparatur": "🔧",
  "dachreparatur (ziegel ersetzen)": "🔧",
  "dachdämmung": "🧣",
  "dämmung": "🧣",
  "daemmung": "🧣",
  "dachfenster": "🪟",
  "dachfenster einbauen": "🪟",
  "dachrinne": "💧",
  "dachrinne reparieren/erneuern": "💧",
  "dachinspektion": "🔍",
  "inspektion": "🔍",
  "flachdachabdichtung": "🏢",
  
  // === Fassade ===
  "fassadenanstrich": "🎨",
  "fassadendämmung": "🧣",
  "fassade verputzen": "🧱",
  "verputzen": "🧱",
  "fassadenreinigung": "✨",
  "reinigung": "✨",
  "risse ausbessern": "🔧",
  "risse": "🔧",
  "balkon": "🏠",
  "balkonsanierung": "🏠",
  "vollwärmeschutz": "🧣",
  "vollwaermeschutz": "🧣",
  
  // === Maler ===
  "wände streichen": "🎨",
  "waende_streichen": "🎨",
  "wohnung/zimmer streichen": "🏠",
  "decke streichen": "🖌️",
  "decke": "🖌️",
  "tapezieren": "📜",
  "tapete anbringen": "📜",
  "tapete entfernen": "🗑️",
  "lackierarbeiten": "✨",
  "lackierarbeiten (türen, fenster)": "✨",
  "lackierarbeiten (türen/fenster)": "✨",
  "fassade streichen": "🏠",
  "außenanstrich": "🏠",
  "spachtelarbeiten": "🔧",
  "spachteln": "🔧",
  "dekorative techniken": "🎭",
  "wischtechnik": "🎭",
  "effekte": "🎭",
  "muster": "🎭",
  
  // === Gebäudetypen ===
  "wohnung": "🏠",
  "wohnung/apartment": "🏠",
  "haus": "🏡",
  "einfamilienhaus": "🏡",
  "mehrfamilienhaus": "🏢",
  "gewerbe": "🏢",
  "gewerbe/büro": "🏢",
  "gewerbegebäude": "🏢",
  "denkmalschutz": "🏛️",
  "denkmalgeschütztes gebäude": "🏛️",
  
  // === Zustand ===
  "gut": "👍",
  "gut (keine schäden)": "👍",
  "gut, nur anstrich nötig": "👍",
  "leichte risse/löcher": "🔧",
  "leichte_risse": "🔧",
  "stark beschädigt": "⚠️",
  "stark beschädigt, spachteln nötig": "⚠️",
  "stark_beschaedigt": "⚠️",
  "feuchteschäden": "💧",
  "feuchtigkeit": "💧",
  "putz abgeplatzt/beschädigt": "⚠️",
  "abgeplatzt": "⚠️",
  
  // === Möblierung ===
  "leer": "📦",
  "nein, räume sind leer": "📦",
  "teilweise": "🪑",
  "teilweise möbliert": "🪑",
  "vollmöbliert": "🛋️",
  "ja, vollständig möbliert": "🛋️",
  
  // === Material/Farbe ===
  "handwerker": "👷",
  "handwerker soll farbe mitbringen": "👷",
  "kunde": "🛒",
  "ich besorge die farbe selbst": "🛒",
  
  // === Notfall ===
  "ja, kein strom": "⚡",
  "kein_strom": "⚡",
  "ja, sicherheitsrisiko": "🔥",
  "ja, sicherheitsrisiko (funken, kurzschluss)": "🔥",
  "gefahr": "🔥",
  "ja, wasserrohrbruch/leck": "💧",
  "wasserrohrbruch": "💧",
  "ja, schwere verstopfung": "🚫",
  "verstopfung_schwer": "🚫",
  "ja, heizung ausgefallen (winter)": "❄️",
  "heizung_ausfall": "❄️",
  "nein, normale arbeiten": "✅",
  "normal": "✅",
  "ja, dach ist undicht": "💧",
  "ja_leck": "💧",
  "ja, ziegel/schindeln beschädigt": "🔧",
  "ja_ziegel": "🔧",
  "nein, präventive arbeiten": "🔧",
  
  // === Zugänglichkeit ===
  "ja, gut zugänglich": "✅",
  "gut zugänglich": "✅",
  "schwierig": "⚠️",
  "schwierig (gerüst nötig)": "⚠️",
  
  // === Gerüst ===
  "ja, gerüst erforderlich": "🏗️",
  "gerüst ist bereits vorhanden": "✅",
  "nein, ohne gerüst möglich": "👍",
  
  // === Bad Renovierung ===
  "ja, bad komplett erneuern": "🛁",
  "ja_komplett": "🛁",
  "teilweise (einzelne elemente)": "🔧",
  "nein, nur reparatur/wartung": "🔧",
  
  // === Stockwerke ===
  "1 stockwerk": "1️⃣",
  "1 stockwerk (erdgeschoss)": "1️⃣",
  "2 stockwerke": "2️⃣",
  "3-4 stockwerke": "🏢",
  "5+ stockwerke": "🏙️",
  
  // === Bau/Rohbau ===
  "rohbau": "🏗️",
  "umbau": "🔨",
  "renovierung": "🔧",
  "estrich": "🧱",
  "abbruch": "🔨",
  "abriss": "🔨",
  "garten": "🌳",
  "gartenarbeit": "🌳",
  "terrasse": "🏡",
  "zaun": "🏠",
  "pflaster": "🧱",
  "pflasterarbeiten": "🧱",
  
  // === Sonstige Kategorien ===
  "andere angelegenheiten nach absprache": "💬",
  "sonstige malerarbeiten": "🎨",
  "sonstiges": "📋",
  
  // === Timing ===
  "so schnell wie möglich": "🔴",
  "so schnell wie möglich (dringend)": "🔴",
  "urgent": "🔴",
  "nach rücksprache": "💬",
  "consultation": "💬",
  "innerhalb von 2 wochen": "📅",
  "2_weeks": "📅",
  "innerhalb von 1 monat": "📆",
  "1_month": "📆",
  "innerhalb von 3 monaten": "🗓️",
  "3_months": "🗓️",
  "flexibel / noch nicht festgelegt": "🟢",
  
  // === Subcategories Maler ===
  "innenwände": "🏠",
  "innenwände, decken, türen streichen": "🏠",
  "raufaser": "📜",
  "raufaser, vliestapete, mustertapete": "📜",
  "deckenanstrich": "🖌️",
  "deckenanstrich, kassettendecke": "🖌️",
  "außenanstrich (maler)": "🏠",
  "türen, fenster, heizkörper lackieren": "✨",
  "risse ausbessern, q2-q4 verspachtelung": "🔧",
  "wischtechnik, effekte, muster": "🎭",
  "sonstige malerarbeiten nach individueller absprache": "💬",
};

/**
 * Gets an appropriate emoji for an option based on its value or label
 * Searches through multiple variations to find a match
 */
export function getOptionEmoji(value: string, label?: string): string {
  const normalizedValue = value.toLowerCase().trim();
  const normalizedLabel = label?.toLowerCase().trim() || '';
  
  // Try exact match on value first
  if (emojiMap[normalizedValue]) {
    return emojiMap[normalizedValue];
  }
  
  // Try exact match on label
  if (normalizedLabel && emojiMap[normalizedLabel]) {
    return emojiMap[normalizedLabel];
  }
  
  // Try partial match on value
  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (normalizedValue.includes(key) || key.includes(normalizedValue)) {
      return emoji;
    }
  }
  
  // Try partial match on label
  if (normalizedLabel) {
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (normalizedLabel.includes(key) || key.includes(normalizedLabel)) {
        return emoji;
      }
    }
  }
  
  // Default fallback
  return "📋";
}

/**
 * Gets emoji for subcategory cards based on name/description
 */
export function getSubcategoryEmoji(name: string, description?: string): string {
  const normalizedName = name.toLowerCase().trim();
  const normalizedDesc = description?.toLowerCase().trim() || '';
  
  // Specific subcategory mappings
  const subcategoryMap: Record<string, string> = {
    // Elektriker
    "steckdosen & leitungen": "🔌",
    "pv-anlage": "☀️",
    "wallbox": "🔋",
    "smart home": "🏠",
    "zählerschrank": "📊",
    "beleuchtung": "💡",
    "elektroherd anschluss": "🍳",
    "sicherungen": "⚡",
    
    // Sanitär-Heizung
    "badezimmer renovierung": "🛁",
    "toilette & wc": "🚽",
    "waschbecken & armaturen": "🚰",
    "dusche & badewanne": "🚿",
    "heizung wartung": "🔥",
    "heizung reparatur": "🔧",
    "heizkörper": "🌡️",
    "rohrleitungen": "🔧",
    "boiler & warmwasser": "🔥",
    "solar-thermie": "☀️",
    
    // Dachdecker
    "dach neueindeckung": "🏠",
    "dachreparatur": "🔧",
    "dachdämmung": "🧣",
    "dachfenster": "🪟",
    "dachrinne & entwässerung": "💧",
    "flachdach": "🏢",
    "kaminarbeiten": "🔥",
    
    // Fassade
    "fassadenanstrich": "🎨",
    "fassadendämmung": "🧣",
    "fassade verputzen": "🧱",
    "fassadenreinigung": "✨",
    "balkonsanierung": "🏠",
    "vollwärmeschutz": "🧣",
    
    // Maler
    "wohnung/zimmer streichen": "🏠",
    "tapezieren": "📜",
    "decke streichen": "🖌️",
    "fassade streichen": "🏠",
    "lackierarbeiten (türen/fenster)": "✨",
    "spachtelarbeiten": "🔧",
    "dekorative techniken": "🎭",
    
    // Bau/Rohbau
    "rohbau": "🏗️",
    "umbau & renovierung": "🔨",
    "estrich": "🧱",
    "abbruch & entsorgung": "🔨",
    "garten & außenanlage": "🌳",
    
    // Andere
    "andere angelegenheiten nach absprache": "💬",
  };
  
  // Try exact match
  if (subcategoryMap[normalizedName]) {
    return subcategoryMap[normalizedName];
  }
  
  // Try partial match
  for (const [key, emoji] of Object.entries(subcategoryMap)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return emoji;
    }
  }
  
  // Try description match
  if (normalizedDesc) {
    for (const [key, emoji] of Object.entries(emojiMap)) {
      if (normalizedDesc.includes(key)) {
        return emoji;
      }
    }
  }
  
  // Fallback based on common keywords
  if (normalizedName.includes("elektr") || normalizedName.includes("strom")) return "⚡";
  if (normalizedName.includes("sanitär") || normalizedName.includes("wasser") || normalizedName.includes("bad")) return "💧";
  if (normalizedName.includes("heiz") || normalizedName.includes("warm")) return "🔥";
  if (normalizedName.includes("dach")) return "🏠";
  if (normalizedName.includes("fassade") || normalizedName.includes("außen")) return "🏢";
  if (normalizedName.includes("maler") || normalizedName.includes("streich") || normalizedName.includes("farb")) return "🎨";
  if (normalizedName.includes("bau") || normalizedName.includes("rohbau")) return "🏗️";
  if (normalizedName.includes("garten")) return "🌳";
  if (normalizedName.includes("tapete") || normalizedName.includes("tapezier")) return "📜";
  if (normalizedName.includes("lack")) return "✨";
  if (normalizedName.includes("spachtel")) return "🔧";
  if (normalizedName.includes("andere") || normalizedName.includes("sonstig")) return "💬";
  
  return "📋";
}
