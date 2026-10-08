-- CreateTable
CREATE TABLE "service_status_changes" (
    "id" UUID NOT NULL,
    "service_id" UUID NOT NULL,
    "from_status" "health_status",
    "to_status" "health_status" NOT NULL,
    "changed_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "service_status_changes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_status_changes_service_id_changed_at_idx" ON "service_status_changes"("service_id", "changed_at" DESC);

-- CreateIndex
CREATE INDEX "service_status_changes_changed_at_idx" ON "service_status_changes"("changed_at");

-- AddForeignKey
ALTER TABLE "service_status_changes" ADD CONSTRAINT "service_status_changes_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;
