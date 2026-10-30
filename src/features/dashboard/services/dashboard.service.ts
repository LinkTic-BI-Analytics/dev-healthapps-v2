import { apiFetch } from "@/lib/api-fetch";
import type { DashboardData } from "../types/dashboard.types";

export const DashboardService = {
  get: (): Promise<DashboardData> => apiFetch<DashboardData>("/api/dashboard", { cache: "no-store" }),
};
