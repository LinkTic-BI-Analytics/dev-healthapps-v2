import { parseHttpErrorResponse } from "@/lib/parse-http-error-response";

const res = (body: string, status: number, statusText = "") => new Response(body, { status, statusText });

describe("parseHttpErrorResponse", () => {
  it("respeta un ApiError en JSON", async () => {
    const body = { message: ["El email es obligatorio"], error: "Bad Request", statusCode: 400 };
    expect(await parseHttpErrorResponse(res(JSON.stringify(body), 400))).toEqual(body);
  });

  it("usa el message de otro JSON", async () => {
    expect(await parseHttpErrorResponse(res(JSON.stringify({ message: "Conflicto" }), 409, "Conflict"))).toEqual({
      message: "Conflicto",
      error: "Conflict",
      statusCode: 409,
    });
  });

  it("usa texto plano corto como mensaje", async () => {
    expect((await parseHttpErrorResponse(res("Servicio caído", 503))).message).toBe("Servicio caído");
  });

  it("convierte HTML de un proxy (413) en un mensaje accionable", async () => {
    const err = await parseHttpErrorResponse(res("<html><body>413 Request Entity Too Large</body></html>", 413));
    expect(err.statusCode).toBe(413);
    expect(err.message).toMatch(/demasiado grande/);
  });

  it("usa un mensaje genérico con cuerpo vacío", async () => {
    expect((await parseHttpErrorResponse(res("", 500))).message).toMatch(/error en el servidor/);
  });
});
