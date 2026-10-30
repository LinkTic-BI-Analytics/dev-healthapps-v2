import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import ThemeProvider from "@/components/ThemeProvider";
import ToasterCustom from "@/components/ToasterCustom";
import { cn } from "@/lib/utils";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Health Apps",
  description:
    "Centro de monitoreo del estado, la disponibilidad y el rendimiento de las aplicaciones en operación.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1214" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: next-themes agrega la clase del tema antes de hidratar.
    <html lang="es" suppressHydrationWarning className={cn("h-full", plexSans.variable, plexMono.variable)}>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          {children}
          <ToasterCustom />
        </ThemeProvider>
      </body>
    </html>
  );
}
