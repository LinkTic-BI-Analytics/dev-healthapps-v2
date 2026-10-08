import { db } from "@/lib/db";

// Healthcheck de la propia aplicación (lo usan Docker y los balanceadores): siempre dinámico.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", database: "ok" });
  } catch (err) {
    console.error("[health] La base de datos no responde:", err);
    return Response.json({ status: "error", database: "unreachable" }, { status: 503 });
  }
}
