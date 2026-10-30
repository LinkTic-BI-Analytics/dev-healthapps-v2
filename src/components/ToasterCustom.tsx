"use client";

import { Toaster } from "react-hot-toast";

/** Toaster con los tokens de la línea gráfica; funciona en ambos temas. */
export default function ToasterCustom() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "10px",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "var(--status-ok)", secondary: "var(--popover)" } },
        error: { iconTheme: { primary: "var(--status-down)", secondary: "var(--popover)" } },
      }}
    />
  );
}
