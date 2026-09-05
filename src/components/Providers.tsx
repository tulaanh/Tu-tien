"use client";

import { CultivatorProvider } from "@/lib/cultivatorContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <CultivatorProvider>{children}</CultivatorProvider>;
}
