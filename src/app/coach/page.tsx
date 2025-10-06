'use client';

import Consent from '@/components/Consent';
import VoiceCoach from '@/components/VoiceCoach';

export default function CoachPage() {
  return (
    <main className="container">
      <h1>Debate Voice Coach (MVP)</h1>
      <p className="muted">Speak → auto-transcribe → edit → get feedback.</p>

      <Consent />
      <VoiceCoach />
    </main>
  );
}