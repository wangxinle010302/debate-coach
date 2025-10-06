'use client';

// src/app/coach/page.tsx
import Consent from "@/components/Consent";
import dynamic from "next/dynamic";

const VoiceCoach = dynamic(() => import("@/components/VoiceCoach"), { ssr:false });

export default function CoachPage() {
  return (
    <>
      <Consent />
      <VoiceCoach />
    </>
  );
}
git add src/app/coach/page.tsx