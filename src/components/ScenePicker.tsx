"use client";

import Image from "next/image";
import { SCENE_LIST, SCENES, SceneKey } from "@/lib/scenes";
import { useState } from "react";

type Props = {
  value: SceneKey | null;
  onChange: (v: SceneKey) => void;
};

export default function ScenePicker({ value, onChange }: Props) {
  // 为了 onError 时兜底占位
  const [broken, setBroken] = useState<Record<string, boolean>>({});

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {SCENE_LIST.map((key) => {
        const scene = SCENES[key];
        const selected = value === key;

        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={[
              "group relative rounded-xl overflow-hidden border transition",
              selected
                ? "border-white/80 ring-2 ring-fuchsia-400"
                : "border-white/10 hover:border-white/30",
            ].join(" ")}
            aria-pressed={selected}
          >
            <div className="relative aspect-[16/9]">
              <Image
                src={
                  broken[key]
                    ? "/scenes/placeholder.png"
                    : scene.img
                }
                alt={scene.label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 20vw"
                onError={() => setBroken((b) => ({ ...b, [key]: true }))}
                priority={key === SCENE_LIST[0]} // 少量优先
              />
              {/* 底部渐变 & 标题 */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="pointer-events-none absolute left-3 bottom-2 text-left">
                <span className="text-white text-sm font-semibold drop-shadow">
                  {scene.label}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}