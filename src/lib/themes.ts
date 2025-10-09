// src/lib/themes.ts
export type ThemeId =
  | "bio_ethics_lab"
  | "server_hall_neon"
  | "neon_forest"
  | "ocean_climate"
  | "data_privacy_city"
  | "ai_classroom"
  | "free_speech_agora"
  | "tech_labor_factory"
  | "healthcare_ai_clinic"
  | "urban_mobility";

export const THEMES: Record<ThemeId, { label: string; file: string }> = {
  bio_ethics_lab:       { label: "Bio Ethics Lab",        file: "bio-ethics-lab.png" },
  server_hall_neon:     { label: "Server Hall (Neon)",    file: "server-hall-neon.png" },
  neon_forest:          { label: "Neon Forest",           file: "neon-forest.png" },
  ocean_climate:        { label: "Ocean & Climate",       file: "ocean-climate.png" },
  data_privacy_city:    { label: "Data Privacy City",     file: "data-privacy-city.png" },
  ai_classroom:         { label: "AI Classroom",          file: "ai-classroom.png" },
  free_speech_agora:    { label: "Free Speech Agora",     file: "free-speech-agora.png" },
  tech_labor_factory:   { label: "Tech & Labor Factory",  file: "tech-labor-factory.png" },
  healthcare_ai_clinic: { label: "Healthcare AI Clinic",  file: "healthcare-ai-clinic.png" },
  urban_mobility:       { label: "Urban Mobility",        file: "urban-mobility.png" },
};

export const DEFAULT_THEME: ThemeId = "server_hall_neon";
export const THEME_ORDER: ThemeId[] = [
  "bio_ethics_lab","server_hall_neon","neon_forest","ocean_climate","data_privacy_city",
  "ai_classroom","free_speech_agora","tech_labor_factory","healthcare_ai_clinic","urban_mobility",
];