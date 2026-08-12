"use client";

import { useAppStore } from "@/store";
import Image from "next/image";
import { useEffect, useState } from "react";

export function HydrationGuard({ children }: { children: React.ReactNode }) {
  const { _hasHydrated } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !_hasHydrated) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#090A0C]">
        <div className="animate-pulse">
          <Image src="/bodimalogoappicon.png" alt="Loading..." width={80} height={80} className="opacity-50 grayscale" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
