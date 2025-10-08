import { Suspense } from "react";
import DebateClient from "./DebateClient";

// 避免预渲染拿不到 URL 参数也可以加上这一行（可选其一）
export const dynamic = "force-dynamic"; // 或者 export const revalidate = 0;

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <DebateClient />
    </Suspense>
  );
}