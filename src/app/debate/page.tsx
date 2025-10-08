import VoiceCoach from "@/components/VoiceCoach";

// 场景 id -> PNG 文件路径
const SCENE_FILE: Record<string, string> = {
  "data-privacy-city": "/scenes/data-privacy-city.png",
  "server-hall-neon": "/scenes/server-hall-neon.png",
  "bio-ethics-lab": "/scenes/bio-ethics-lab.png",
  "ocean-climate": "/scenes/ocean-climate.png",
  "neon-forest": "/scenes/neon-forest.png",
  "ai-classroom": "/scenes/ai-classroom.png",
  "free-speech-agora": "/scenes/free-speech-agora.png",
  "tech-labor-factory": "/scenes/tech-labor-factory.png",
  "healthcare-ai-clinic": "/scenes/healthcare-ai-clinic.png",
  "urban-mobility": "/scenes/urban-mobility.png",
};

export default function DebatePage({
  searchParams,
}: {
  searchParams: { topic?: string; scene?: string; langA?: string; langB?: string };
}) {
  const topic =
    searchParams.topic ??
    "Should platforms filter harmful language in conversations?";
  const scene = searchParams.scene ?? "data-privacy-city";
  const langA = searchParams.langA ?? "en";
  const langB = searchParams.langB ?? "en";
  const bg = SCENE_FILE[scene] ?? SCENE_FILE["data-privacy-city"];

  return (
    <div className="debate-wrap">
      <div className="debate-bg" style={{ backgroundImage: `url(${bg})` }} aria-hidden />
      <div className="debate-content">
        <VoiceCoach initialTopic={topic} langA={langA} langB={langB} />
      </div>
    </div>
  );
}
