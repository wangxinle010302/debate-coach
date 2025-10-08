// src/app/debate/page.tsx  —— Server Component 版本
import Image from "next/image";
import { SCENES } from "@/lib/scenes";

export const dynamic = "force-dynamic"; // 避免 Vercel 预渲染卡住

type SceneKey = keyof typeof SCENES;

type PageProps = {
  searchParams?: {
    theme?: SceneKey;
    topic?: string;
    langA?: string;
    langB?: string;
  };
};

export default function DebatePage({ searchParams }: PageProps) {
  const theme = (searchParams?.theme as SceneKey) ?? "server_hall_neon";
  const scene = SCENES[theme] ?? null;

  const topic = searchParams?.topic ?? "";
  const langA = searchParams?.langA ?? "中文";
  const langB = searchParams?.langB ?? "English";

  return (
    <div className="min-h-dvh relative text-white">
      {scene ? (
        <Image
          src={scene.img}
          alt={scene.label}
          fill
          className="object-cover -z-10 opacity-60 blur-sm"
          priority
        />
      ) : (
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 to-slate-950" />
      )}

      <div className="mx-auto max-w-6xl px-4 py-6">
        <h2 className="text-xl md:text-2xl font-semibold opacity-90">{topic}</h2>
        <p className="text-sm text-white/70 mt-1">
          A: {langA} · B: {langB}
        </p>

        {/* 这里放你的对话左右栏 UI（保持你已有实现即可） */}
      </div>
    </div>
  );
}