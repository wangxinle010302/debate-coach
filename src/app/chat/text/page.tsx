import { Suspense } from "react";
import Client from "./Client";

export default function Page() {
  return (
    <Suspense fallback={<div style={{height:"100vh"}} />}>
      <Client />
    </Suspense>
  );
}