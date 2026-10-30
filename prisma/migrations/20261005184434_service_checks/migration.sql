-- CreateEnum
CREATE TYPE "check_outcome" AS ENUM ('success', 'failure', 'skipped');

-- DropIndex
DROP INDEX "services_is_active_idx";

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "check_interval_seconds" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_checked_at" TIMESTAMPTZ(6),
ADD COLUMN     "last_response_time_ms" INTEGER,
ADD COLUMN     "next_check_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "timeout_ms" INTEGER NOT NULL DEFAULT 10000;

-- CreateTable
CREATE TABLE "service_checks" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "checked_at" TIMESTAMPTZ(6) NOT NULL,
    "outcome" "check_outcome" NOT NULL,
    "http_status" INTEGER,
    "response_time_ms" INTEGER,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "service_checks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_checks_service_id_checked_at_idx" ON "service_checks"("service_id", "checked_at" DESC);

-- CreateIndex
CREATE INDEX "service_checks_checked_at_idx" ON "service_checks"("checked_at");

-- CreateIndex
CREATE INDEX "services_is_active_next_check_at_idx" ON "services"("is_active", "next_check_at");

-- AddForeignKey
ALTER TABLE "service_checks" ADD CONSTRAINT "service_checks_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Frecuencia y timeout razonables (ADR-004).
ALTER TABLE "services"
  ADD CONSTRAINT "services_check_interval_seconds_check" CHECK ("check_interval_seconds" BETWEEN 10 AND 86400),
  ADD CONSTRAINT "services_timeout_ms_check" CHECK ("timeout_ms" BETWEEN 100 AND 60000),
  ADD CONSTRAINT "services_consecutive_failures_check" CHECK ("consecutive_failures" >= 0);
