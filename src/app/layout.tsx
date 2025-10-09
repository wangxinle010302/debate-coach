import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Debate Coach',
  description: 'Speak. Rewrite. Compare.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}