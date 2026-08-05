"use client";

import { useEffect, useState } from "react";

export function useCountUp(end: number, duration: number = 500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // Calculate current value based on progress and total duration
      const percentage = Math.min(progress / duration, 1);
      
      // Use easeOutQuart for smooth slow-down at the end
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      
      const currentVal = Math.floor(easeOut * end);
      
      setCount(currentVal);
      
      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    // Start animation
    setCount(0); // Reset to 0 before starting if target changes
    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}
