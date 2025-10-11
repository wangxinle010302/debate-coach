export type ThemeKey =
  | "bio-ethics-lab"
  | "server-hall-neon"
  | "neon-forest"
  | "ocean-climate"
  | "data-privacy-city"
  | "ai-classroom"
  | "free-speech-agora"
  | "tech-labor-factory"
  | "healthcare-ai-clinic"
  | "urban-mobility";

export type ThemeItem = { key: ThemeKey; name: string; src: string };

export const THEMES: ThemeItem[] = [
  { key: "bio-ethics-lab",        name: "Bio Ethics Lab",         src: "/scenes/bio-ethics-lab.png" },
  { key: "server-hall-neon",      name: "Server Hall (Neon)",     src: "/scenes/server-hall-neon.png" },
  { key: "neon-forest",           name: "Neon Forest",            src: "/scenes/neon-forest.png" },
  { key: "ocean-climate",         name: "Ocean & Climate",        src: "/scenes/ocean-climate.png" },
  { key: "data-privacy-city",     name: "Data Privacy City",      src: "/scenes/data-privacy-city.png" },
  { key: "ai-classroom",          name: "AI Classroom",           src: "/scenes/ai-classroom.png" },
  { key: "free-speech-agora",     name: "Free Speech Agora",      src: "/scenes/free-speech-agora.png" },
  { key: "tech-labor-factory",    name: "Tech & Labor Factory",   src: "/scenes/tech-labor-factory.png" },
  { key: "healthcare-ai-clinic",  name: "Healthcare AI Clinic",   src: "/scenes/healthcare-ai-clinic.png" },
  { key: "urban-mobility",        name: "Urban Mobility",         src: "/scenes/urban-mobility.png" },
];

export const THEME_BY_KEY = new Map(THEMES.map(t => [t.key, t]));