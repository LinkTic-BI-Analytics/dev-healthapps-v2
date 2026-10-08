// @vitest-environment node
import { apiErrorResponse, toApiErrorResponse } from "@/lib/api-error-response";
import { HttpError } from "@/lib/http-error";

describe("apiErrorResponse", () => {
  it("responde con el formato ApiError", async () => {
    const res = apiErrorResponse(404, "No encontrado");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ statusCode: 404, message: "No encontrado", error: "Not Found" });
  });
});

describe("toApiErrorResponse", () => {
  it("traduce HttpError conservando los mensajes", async () => {
    const res = toApiErrorResponse(new HttpError(400, ["a", "b"]));
    expect(await res.json()).toEqual({ statusCode: 400, message: ["a", "b"], error: "Bad Request" });
  });

  it("oculta los detalles de errores no controlados", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = toApiErrorResponse(new Error("detalle interno"));
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toContain("detalle interno");
  });
});
