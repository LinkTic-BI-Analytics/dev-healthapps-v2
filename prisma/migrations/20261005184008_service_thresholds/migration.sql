-- AlterTable
ALTER TABLE "services" ADD COLUMN     "degraded_response_time_ms" INTEGER NOT NULL DEFAULT 1000,
ADD COLUMN     "down_after_failures" INTEGER NOT NULL DEFAULT 3;

-- Los parámetros esperados siempre son positivos y razonables (BR-05).
ALTER TABLE "services"
  ADD CONSTRAINT "services_degraded_response_time_ms_check" CHECK ("degraded_response_time_ms" BETWEEN 1 AND 120000),
  ADD CONSTRAINT "services_down_after_failures_check" CHECK ("down_after_failures" BETWEEN 1 AND 100);
