export type CalmLang = 'zh' | 'en';

export type CalmState = {
  lang: CalmLang;
  warmupDone?: boolean;
  rounds478?: number;
};

const KEY = 'calm-state:v1';

export function loadCalm(): CalmState {
  if (typeof window === 'undefined') return { lang: 'zh' };
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { lang: 'zh', ...JSON.parse(raw) } : { lang: 'zh' };
  } catch {
    return { lang: 'zh' };
  }
}

export function saveCalm(partial: Partial<CalmState>): CalmState {
  if (typeof window === 'undefined') return { lang: 'zh' };
  const cur = loadCalm();
  const next = { ...cur, ...partial };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}