"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    const snapToTop = () => {
      const scrollContainer = document.getElementById('main-scroll-container');
      if (scrollContainer && scrollContainer.scrollTop > 0) {
        scrollContainer.scrollTop = 0;
      }
    };

    // Fire once immediately
    snapToTop();
    // Fire once after layout
    const t1 = setTimeout(snapToTop, 50);

    return () => clearTimeout(t1);
  }, [pathname]);

  return null;
}
