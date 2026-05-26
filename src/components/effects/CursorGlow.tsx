"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top = `${e.clientY}px`;
      }
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="cursor-dot"
        style={{
          width: "8px",
          height: "8px",
          background: "#00d4ff",
          boxShadow: "0 0 10px #00d4ff, 0 0 20px rgba(0,212,255,0.5)",
        }}
      />
      <div
        ref={glowRef}
        className="cursor-dot"
        style={{
          width: "40px",
          height: "40px",
          background: "rgba(0,212,255,0.06)",
          border: "1px solid rgba(0,212,255,0.15)",
          transition: "left 0.12s ease, top 0.12s ease",
        }}
      />
    </>
  );
}
