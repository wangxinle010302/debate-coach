// src/app/debate/page.tsx
import DebateClient from './DebateClient';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

type SP = { [k: string]: string | string[] | undefined };

export default function Page({ searchParams }: { searchParams?: SP }) {
  const sp = searchParams ?? {};
  const pick = (v: string | string[] | undefined, d: string) =>
    typeof v === 'string' ? v : d;

  const theme = pick(sp.theme, 'server_hall_neon');
  const topic = pick(sp.topic, '');
  const langA = pick(sp.langA, 'zh');
  const langB = pick(sp.langB, 'en');

  return <DebateClient theme={theme} topic={topic} langA={langA} langB={langB} />;
}