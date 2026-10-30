import { apiFetch } from "@/lib/api-fetch";
import type { DetailRange, ServiceDetailData } from "../types/service-detail.types";

export const ServiceDetailService = {
  get: (id: string, range: DetailRange): Promise<ServiceDetailData> =>
    apiFetch<ServiceDetailData>(`/api/services/${id}/detail?range=${range}`, { cache: "no-store" }),
};
