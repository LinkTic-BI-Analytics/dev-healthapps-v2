-- AlterTable
ALTER TABLE "service_checks" ADD COLUMN     "body_excerpt" TEXT,
ADD COLUMN     "degraded_reason" TEXT;

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "last_components" JSONB;
