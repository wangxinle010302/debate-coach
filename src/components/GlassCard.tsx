'use client';
import { PropsWithChildren } from 'react';

export default function GlassCard({ children, title, right }:
  PropsWithChildren<{ title?:string; right?:React.ReactNode }>) {
  return (
    <div className="panel fade-enter">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
        <div style={{fontWeight:700}}>{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}
