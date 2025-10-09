'use client';

import { Suspense } from 'react';

// 同样关闭预渲染 & 缓存（不要导出 revalidate）
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import VoiceChatClient from './VoiceChatClient';

export default function VoiceChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <VoiceChatClient />
    </Suspense>
  );
}