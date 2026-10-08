import { apiFetch } from "@/lib/api-fetch";
import type { ManualCheckSummary } from "../types/check.types";

export const ChecksService = {
  runAll: async (): Promise<ManualCheckSummary> =>
    (await apiFetch<{ summary: ManualCheckSummary }>("/api/checks/run", { method: "POST" })).summary,
};
