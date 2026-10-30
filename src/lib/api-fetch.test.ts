import { apiFetch, configureApiSession } from "@/lib/api-fetch";

const fetchMock = vi.fn();
beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});
afterAll(() => vi.unstubAllGlobals());

describe("apiFetch", () => {
  it("envía JSON con cookies de sesión y devuelve la respuesta tipada", async () => {
    fetchMock.mockResolvedValue(Response.json({ id: "1" }));
    await expect(apiFetch<{ id: string }>("/api/x", { method: "POST", json: { a: 1 } })).resolves.toEqual({ id: "1" });
    const [, init] = fetchMock.mock.calls[0];
    expect(init.credentials).toBe("same-origin");
    expect(init.body).toBe('{"a":1}');
    expect(new Headers(init.headers).get("Content-Type")).toBe("application/json");
  });

  it("devuelve undefined en 204", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiFetch("/api/x")).resolves.toBeUndefined();
  });

  it("lanza ApiError si la respuesta falla", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "No", error: "Forbidden", statusCode: 403 }, { status: 403 }));
    await expect(apiFetch("/api/x")).rejects.toMatchObject({ statusCode: 403, message: "No" });
  });

  it("lanza un ApiError accionable si el servidor no responde", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(apiFetch("/api/x")).rejects.toMatchObject({ statusCode: 0, error: "NetworkError" });
  });
});

describe("apiFetch con sesión", () => {
  afterEach(() => configureApiSession(null));

  it("ante un 401 renueva la sesión una vez y reintenta", async () => {
    const refresh = vi.fn().mockResolvedValue(true);
    const onSessionExpired = vi.fn();
    configureApiSession({ refresh, onSessionExpired });
    fetchMock
      .mockResolvedValueOnce(Response.json({ message: "x", error: "Unauthorized", statusCode: 401 }, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ ok: true }));
    await expect(apiFetch("/api/x")).resolves.toEqual({ ok: true });
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it("si la renovación falla, avisa que la sesión expiró y lanza el 401", async () => {
    const onSessionExpired = vi.fn();
    configureApiSession({ refresh: vi.fn().mockResolvedValue(false), onSessionExpired });
    fetchMock.mockImplementation(async () =>
      Response.json({ message: "x", error: "Unauthorized", statusCode: 401 }, { status: 401 }),
    );
    await expect(apiFetch("/api/x")).rejects.toMatchObject({ statusCode: 401 });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("varias peticiones con 401 simultáneas comparten una sola renovación", async () => {
    let resolveRefresh!: (v: boolean) => void;
    const refresh = vi.fn(() => new Promise<boolean>((r) => (resolveRefresh = r)));
    configureApiSession({ refresh, onSessionExpired: vi.fn() });
    const unauthorized = () => Response.json({ message: "x", error: "Unauthorized", statusCode: 401 }, { status: 401 });
    fetchMock
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(unauthorized())
      .mockImplementation(async () => Response.json({ ok: true }));
    const both = Promise.all([apiFetch("/api/a"), apiFetch("/api/b")]);
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled());
    resolveRefresh(true);
    await both;
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("no reintenta cuando retryOnUnauthorized es false", async () => {
    const refresh = vi.fn();
    configureApiSession({ refresh, onSessionExpired: vi.fn() });
    fetchMock.mockResolvedValue(Response.json({ message: "x", error: "Unauthorized", statusCode: 401 }, { status: 401 }));
    await expect(apiFetch("/api/auth/login", { retryOnUnauthorized: false })).rejects.toMatchObject({ statusCode: 401 });
    expect(refresh).not.toHaveBeenCalled();
  });
});
