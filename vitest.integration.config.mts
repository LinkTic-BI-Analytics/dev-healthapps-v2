import { defineConfig } from "vitest/config";

// Pruebas contra un PostgreSQL real configurado en .env (ver docker-compose.yml).
export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: { "server-only": new URL("./src/test/server-only-stub.ts", import.meta.url).pathname },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["dotenv/config"],
    include: ["src/**/*.integration.test.ts"],
    fileParallelism: false,
    testTimeout: 20000,
  },
});
