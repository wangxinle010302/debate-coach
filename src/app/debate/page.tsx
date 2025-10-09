// src/app/debate/page.tsx
import React from "react";
import DebateClient, { DebateClientProps } from "./DebateClient";

/** 让本页始终在运行时渲染，避免 SSG 期间的预渲染报错 */
export const dynamic = "force-dynamic";

type SearchParams =
  | { [key: string]: string | string[] | undefined }
  | undefined;

/** 从 searchParams 里稳妥地拿字符串（处理数组/undefined） */
function getStr(
  sp: SearchParams,
  key: string,
  fallback = ""
): string {
  const v = sp?.[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? fallback;
  return fallback;
}

/** 合法主题白名单（其余值会回落到 server_hall_neon） */
const THEMES = new Set([
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
]);

export default function Page({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  // 读取 URL 参数
  const rawTopic = getStr(
    searchParams,
    "topic",
    "Should platforms filter harmful language in conversations?"
  );
  // 尝试解码（支持你从地址栏直接粘贴已编码的主题）
  const topic = (() => {
    try {
      return decodeURIComponent(rawTopic);
    } catch {
      return rawTopic;
    }
  })();

  const themeRaw = getStr(searchParams, "theme", "server_hall_neon");
  const theme = THEMES.has(themeRaw) ? themeRaw : "server_hall_neon";

  const langA = getStr(searchParams, "langA", "zh");
  const langB = getStr(searchParams, "langB", "en");

  const props: DebateClientProps = {
    theme,
    topic,
    langA,
    langB,
  };

  // 不需要再包 Suspense（这是个客户端子组件，会在浏览器端拿 /api/chat）
  return <DebateClient {...props} />;
}