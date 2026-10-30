-- Historial inicial para los servicios que ya tenían estado antes de WI-014.
INSERT INTO "service_status_changes" ("id", "service_id", "from_status", "to_status", "changed_at", "created_at", "updated_at")
SELECT gen_random_uuid(), s."id", NULL, s."health_status", COALESCE(s."status_changed_at", now()), now(), now()
FROM "services" s
WHERE s."health_status" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "service_status_changes" c WHERE c."service_id" = s."id");
