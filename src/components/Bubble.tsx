'use client';
export type Role = 'user' | 'assistant';

export function Bubble({ role, text }: { role: Role; text: string }) {
  const side = role === 'user' ? 'right' : 'left';
  return (
    <div className={`bubble ${side}`}>
      <div className="bubble-inner"><p>{text}</p></div>
    </div>
  );
}