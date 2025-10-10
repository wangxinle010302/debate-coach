"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Topic = {
  slug: string;
  title: string;
  subtitle: string;
  img: string; // filename in /public/topics
};

const TOPICS: Topic[] = [
  {
    slug: "data-privacy-city",
    title: "Data Privacy City",
    subtitle: "Who owns your data?",
    img: "data-privacy-city.png",
  },
  {
    slug: "ai-classroom",
    title: "AI Classroom",
    subtitle: "Should AI teach critical thinking?",
    img: "ai-classroom.png",
  },
  {
    slug: "free-speech-agora",
    title: "Free Speech Agora",
    subtitle: "Where do we draw the line?",
    img: "free-speech-agora.png",
  },
  {
    slug: "healthcare-ai-clinic",
    title: "Healthcare AI Clinic",
    subtitle: "Trusting AI with care decisions?",
    img: "healthcare-ai-clinic.png",
  },
];

export default function Home() {
  const router = useRouter();

  function goto(slug: string, mode: "chat" | "voice") {
    // 记住选择，用于子页面背景
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedTopic", slug);
    }
    router.push(`/${mode}?topic=${slug}`);
  }

  return (
    <main className="container">
      <header className="hero">
        <h1>
          <span className="grad">Debate Coach</span>
        </h1>
        <p className="muted">Pick a topic · Choose a mode · Get instant critique</p>
      </header>

      <section className="grid">
        {TOPICS.map((t) => (
          <article key={t.slug} className="tile" aria-label={t.title}>
            <div className="thumb">
              {/* 用 next/image 提升加载体验；确保 public/topics/ 下有对应 png */}
              <Image
                src={`/topics/${t.img}`}
                alt={t.title}
                width={800}
                height={480}
                priority
              />
            </div>
            <div className="tile-title">{t.title}</div>
            <div className="tile-sub">{t.subtitle}</div>

            <div className="actions">
              <button onClick={() => goto(t.slug, "chat")}>Text</button>
              <button onClick={() => goto(t.slug, "voice")}>Voice</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}