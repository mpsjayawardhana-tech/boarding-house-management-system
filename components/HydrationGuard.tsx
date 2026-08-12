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
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-black z-[9999]">
        <div className="animate-slow-pulse">
          <Image 
            src="/bodimalogo.png" 
            alt="Loading..." 
            width={140} 
            height={50} 
            className="invert object-contain opacity-90"
            priority 
          />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
