-- CreateEnum
CREATE TYPE "health_status" AS ENUM ('operativo', 'degradado', 'caido');

-- AlterTable
ALTER TABLE "services" ADD COLUMN     "health_status" "health_status",
ADD COLUMN     "status_changed_at" TIMESTAMPTZ(6);
