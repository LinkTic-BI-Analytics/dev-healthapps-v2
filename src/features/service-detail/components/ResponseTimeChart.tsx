"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { Line } from "react-chartjs-2";
import type { ServiceCheckDto } from "@/features/checks/types/check.types";
import { resolveCssColor } from "@/lib/css-color";
import { formatLatency } from "@/lib/format";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

// 24 h ("14:35"): etiquetas cortas que no se superponen en móvil.
const timeFormat = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

/**
 * Tiempos de respuesta de las verificaciones con la línea de umbral (roja discontinua).
 * Puntos: rojo = fallo, ámbar = por encima del umbral. Se carga solo en el detalle (next/dynamic).
 */
export default function ResponseTimeChart({ checks, thresholdMs }: { checks: ServiceCheckDto[]; thresholdMs: number }) {
  const { resolvedTheme } = useTheme();

  const { data, options } = useMemo(() => {
    // `resolvedTheme` fuerza a releer los tokens cuando cambia el tema.
    void resolvedTheme;
    const line = resolveCssColor("--chart-1");
    const down = resolveCssColor("--status-down");
    const warn = resolveCssColor("--status-warn");
    const grid = resolveCssColor("--border");
    const text = resolveCssColor("--muted-foreground");
    const measured = checks.filter((c) => c.outcome !== "skipped");
    const pointColor = measured.map((c) =>
      c.outcome === "failure" ? down : (c.responseTimeMs ?? 0) > thresholdMs ? warn : line,
    );

    const data: ChartData<"line"> = {
      labels: measured.map((c) => timeFormat.format(new Date(c.checkedAt))),
      datasets: [
        {
          label: "Tiempo de respuesta",
          data: measured.map((c) => c.responseTimeMs ?? 0),
          borderColor: line,
          backgroundColor: resolveCssColor("--chart-1", 0.12),
          fill: true,
          tension: 0.25,
          borderWidth: 2,
          pointRadius: measured.length > 120 ? 0 : 2.5,
          pointBackgroundColor: pointColor,
          pointBorderColor: pointColor,
          pointHoverRadius: 4,
        },
        {
          label: "Umbral",
          data: measured.map(() => thresholdMs),
          borderColor: down,
          borderDash: [3, 4],
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
        },
      ],
    };

    const options: ChartOptions<"line"> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      scales: {
        x: {
          ticks: { color: text, maxTicksLimit: 6, maxRotation: 0, autoSkipPadding: 16 },
          grid: { display: false },
          border: { color: grid },
        },
        y: {
          beginAtZero: true,
          ticks: { color: text, callback: (v) => formatLatency(Number(v)) },
          grid: { color: grid },
          border: { display: false },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              if (ctx.datasetIndex === 1) return `Umbral: ${formatLatency(thresholdMs)}`;
              const check = measured[ctx.dataIndex];
              return check.outcome === "failure"
                ? `Fallo: ${check.errorMessage ?? "sin respuesta"}`
                : `Respuesta: ${formatLatency(check.responseTimeMs ?? 0)}`;
            },
          },
        },
      },
    };
    return { data, options };
  }, [checks, thresholdMs, resolvedTheme]);

  return (
    <div className="h-56 md:h-72" role="img" aria-label={`Gráfica de tiempos de respuesta con umbral de ${formatLatency(thresholdMs)}`}>
      <Line data={data} options={options} />
    </div>
  );
}
