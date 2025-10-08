// src/lib/scenes.ts
export type SceneKey =
  | "data_privacy_city"
  | "server_hall_neon"
  | "bio_ethics_lab"
  | "ocean_climate"
  | "neon_forest"
  | "ai_classroom"
  | "free_speech_agora"
  | "tech_labor_factory"
  | "healthcare_ai_clinic"
  | "urban_mobility";

export const SCENES: Record<SceneKey, { label: string; img: string }> = {
  data_privacy_city:   { label: "Data Privacy City",   img: "/scenes/data-privacy-city.png" },
  server_hall_neon:    { label: "Server Hall (Neon)",  img: "/scenes/server-hall-neon.png" },
  bio_ethics_lab:      { label: "Bio Ethics Lab",       img: "/scenes/bio-ethics-lab.png" },
  ocean_climate:       { label: "Ocean & Climate",      img: "/scenes/ocean-climate.png" },
  neon_forest:         { label: "Neon Forest",          img: "/scenes/neon-forest.png" },
  ai_classroom:        { label: "AI Classroom",         img: "/scenes/ai-classroom.png" },
  free_speech_agora:   { label: "Free Speech Agora",    img: "/scenes/free-speech-agora.png" },
  tech_labor_factory:  { label: "Tech & Labor Factory", img: "/scenes/tech-labor-factory.png" },
  healthcare_ai_clinic:{ label: "Healthcare AI Clinic", img: "/scenes/healthcare-ai-clinic.png" },
  urban_mobility:      { label: "Urban Mobility",       img: "/scenes/urban-mobility.png" },
};

export const SCENE_LIST: SceneKey[] = [
  "bio_ethics_lab",
  "server_hall_neon",
  "neon_forest",
  "ocean_climate",
  "data_privacy_city",
  "ai_classroom",
  "free_speech_agora",
  "tech_labor_factory",
  "healthcare_ai_clinic",
  "urban_mobility",
];