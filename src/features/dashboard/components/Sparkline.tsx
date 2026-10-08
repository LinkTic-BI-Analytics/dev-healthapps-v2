"use client";

import { motion, useReducedMotion } from "motion/react";

/** Mini gráfica de latencias en SVG que se dibuja al aparecer (sin librerías de gráficas). */
export default function Sparkline({
  values,
  className,
  width = 72,
  height = 28,
}: {
  values: (number | null)[];
  className?: string;
  width?: number;
  height?: number;
}) {
  const reduced = useReducedMotion() ?? false;
  const points = values.map((v) => v ?? 0);
  if (points.length < 2) return <svg aria-hidden width={width} height={height} className={className} />;
  const max = Math.max(...points, 1);
  const step = width / (points.length - 1);
  const d = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(height - 2 - (v / max) * (height - 4)).toFixed(1)}`)
    .join(" ");
  return (
    <svg aria-hidden width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className}>
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={reduced ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </svg>
  );
}
