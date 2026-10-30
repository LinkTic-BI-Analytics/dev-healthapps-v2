"use client";

import { animate } from "motion/react";
import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Número que cuenta hasta su valor: desde 0 al montarse y desde el valor anterior cuando cambia.
 * El primer render ya muestra el valor final (SSR, lectores de pantalla y movimiento reducido).
 */
export default function AnimatedNumber({
  value,
  format = (n) => String(Math.round(n)),
  className,
  duration = 0.9,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<number | null>(null);
  const formatRef = useRef(format);

  useEffect(() => {
    formatRef.current = format;
  });

  useEffect(() => {
    const el = ref.current;
    const from = previous.current ?? 0;
    previous.current = value;
    if (!el || prefersReducedMotion() || from === value) {
      if (el) el.textContent = formatRef.current(value);
      return;
    }
    const controls = animate(from, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (n) => {
        el.textContent = formatRef.current(n);
      },
    });
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
