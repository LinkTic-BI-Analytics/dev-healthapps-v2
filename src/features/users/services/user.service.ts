import { apiFetch } from "@/lib/api-fetch";
import type { CreatedUser, CreateUserPayload } from "@/features/auth/types/auth.types";

export const UserService = {
  create: async (payload: CreateUserPayload): Promise<CreatedUser> =>
    (await apiFetch<{ user: CreatedUser }>("/api/users", { method: "POST", json: payload })).user,
};
