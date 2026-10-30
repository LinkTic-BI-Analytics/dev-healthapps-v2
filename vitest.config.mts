import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: { "server-only": new URL("./src/test/server-only-stub.ts", import.meta.url).pathname },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "app/**/*.test.{ts,tsx}"],
    // Las pruebas de integración (base de datos real) se ejecutan con `pnpm test:integration`.
    exclude: ["**/*.integration.test.{ts,tsx}", "**/node_modules/**"],
    css: false,
  },
});
