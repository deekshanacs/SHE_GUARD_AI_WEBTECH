import { useEffect, useRef } from "react";

export default function GlowCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dotRef.current) return;
      dotRef.current.style.transform = `translate(${e.clientX - 10}px, ${e.clientY - 10}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
      ref={dotRef}
      className="pointer-events-none fixed z-50 h-5 w-5 rounded-full
                 bg-[hsl(var(--neon-purple))/20] blur-sm transition-transform duration-75"
      aria-hidden="true"
    />
  );
}
