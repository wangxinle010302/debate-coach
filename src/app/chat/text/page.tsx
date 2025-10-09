'use client';

import { Suspense } from 'react';

// 关闭预渲染 & 缓存（不要再导出 revalidate）
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import TextChatClient from './TextChatClient';

export default function TextChatPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <TextChatClient />
    </Suspense>
  );
}