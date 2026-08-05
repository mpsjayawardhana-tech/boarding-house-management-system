"use client";

import { useEffect, useRef } from "react";

export function useMagnetic<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = element.getBoundingClientRect();
      
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      // Calculate distance from center, scale it down for a subtle pull
      const deltaX = (clientX - centerX) * 0.2;
      const deltaY = (clientY - centerY) * 0.2;
      
      element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    };

    const handleMouseLeave = () => {
      element.style.transform = `translate(0px, 0px)`;
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return ref;
}
