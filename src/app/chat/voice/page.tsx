'use client';

import React, { Suspense } from 'react';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import VoiceChatPage from './VoiceChatClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <VoiceChatPage />
    </Suspense>
  );
}