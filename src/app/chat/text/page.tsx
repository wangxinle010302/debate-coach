'use client';

import React, { Suspense } from 'react';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import TextChatClient from './TextChatClient';

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <TextChatClient />
    </Suspense>
  );
}