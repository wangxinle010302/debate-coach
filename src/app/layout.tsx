export const metadata = {
  title: "Debate Coach MVP",
  description: "Voice input + coaching demo"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}