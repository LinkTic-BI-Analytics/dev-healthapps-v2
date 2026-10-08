import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardView from "./DashboardView";
import { DashboardService } from "../services/dashboard.service";
import type { DashboardData, ServiceHealthSummary } from "../types/dashboard.types";
import { ChecksService } from "@/features/checks/services/checks.service";

vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../services/dashboard.service", () => ({ DashboardService: { get: vi.fn() } }));
vi.mock("@/features/checks/services/checks.service", () => ({ ChecksService: { runAll: vi.fn() } }));

const svc = (id: string, name: string, healthStatus: ServiceHealthSummary["healthStatus"]): ServiceHealthSummary => ({
  id,
  name,
  healthStatus,
  lastResponseTimeMs: 120,
  lastCheckedAt: new Date().toISOString(),
  statusChangedAt: null,
  degradedResponseTimeMs: 1000,
  recentLatencies: [100, 120, 110],
  uptime: { "24h": 95.83, "7d": 99.5, "30d": null },
  components: id === "2" ? { total: 17, issue: "1 de 17 componentes con falla: seizure" } : null,
});

const data: DashboardData = {
  generatedAt: new Date().toISOString(),
  counts: { operativo: 1, degradado: 0, caido: 1, sinDatos: 0 },
  services: [svc("1", "ERP", "caido"), svc("2", "Pagos", "operativo")],
};

describe("DashboardView", () => {
  it("muestra los indicadores globales y una tarjeta por servicio con el estado en texto", async () => {
    vi.mocked(DashboardService.get).mockResolvedValue(data);
    render(<DashboardView canManage />);
    expect(await screen.findByText("1 servicio requiere atención")).toBeInTheDocument();
    const erp = screen.getByRole("link", { name: /ERP: caido/ });
    expect(erp).toHaveAttribute("href", "/servicios/1");
    expect(within(erp).getByText("Caído")).toBeInTheDocument();
    expect(within(erp).getByText("120 ms")).toBeInTheDocument();
  });

  it("filtra por estado", async () => {
    vi.mocked(DashboardService.get).mockResolvedValue(data);
    render(<DashboardView canManage />);
    await screen.findByText("ERP");
    await userEvent.click(screen.getByRole("button", { name: /Operativos/ }));
    // La tarjeta sale con una animación breve antes de desaparecer.
    await waitFor(() => expect(screen.queryByText("ERP")).not.toBeInTheDocument());
    expect(screen.getByText("Pagos")).toBeInTheDocument();
  });

  it("sin servicios muestra un mensaje que lleva al registro", async () => {
    vi.mocked(DashboardService.get).mockResolvedValue({
      ...data,
      counts: { operativo: 0, degradado: 0, caido: 0, sinDatos: 0 },
      services: [],
    });
    render(<DashboardView canManage />);
    expect(await screen.findByText("Todavía no hay servicios monitoreados")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Registrar servicio/ })).toHaveAttribute("href", "/servicios/nuevo");
  });
});

describe("DashboardView uptime", () => {
  it("muestra el uptime de 24 h, 7 d y 30 d en cada tarjeta", async () => {
    vi.mocked(DashboardService.get).mockResolvedValue(data);
    render(<DashboardView canManage />);
    const erp = await screen.findByRole("link", { name: /ERP: caido/ });
    expect(erp).toHaveTextContent("24 h 95,83 %");
    expect(erp).toHaveTextContent("7 d 99,50 %");
    expect(erp).toHaveTextContent("30 d —");
  });
});

describe("DashboardView componentes", () => {
  it("muestra en la tarjeta los componentes con falla del /health", async () => {
    vi.mocked(DashboardService.get).mockResolvedValue(data);
    render(<DashboardView canManage />);
    const pagos = await screen.findByRole("link", { name: /Pagos/ });
    expect(pagos).toHaveTextContent("1 de 17 componentes con falla: seizure");
  });
});

describe("DashboardView animaciones y cambios (WI-024)", () => {
  it("muestra '¡Todo en orden!' cuando todos están operativos", async () => {
    vi.mocked(DashboardService.get).mockResolvedValue({
      ...data,
      counts: { operativo: 2, degradado: 0, caido: 0, sinDatos: 0 },
      services: [svc("1", "ERP", "operativo"), svc("2", "Pagos", "operativo")],
    });
    render(<DashboardView canManage />);
    expect(await screen.findByText("¡Todo en orden!")).toBeInTheDocument();
  });

  it("al actualizar, resalta 'Recuperado' y celebra la recuperación; 'Cambió' para otros cambios", async () => {
    const toast = (await import("react-hot-toast")).default;
    vi.mocked(DashboardService.get)
      .mockResolvedValueOnce(data) // ERP caído, Pagos operativo
      .mockResolvedValueOnce({
        ...data,
        counts: { operativo: 1, degradado: 1, caido: 0, sinDatos: 0 },
        services: [svc("1", "ERP", "operativo"), svc("2", "Pagos", "degradado")],
      });
    render(<DashboardView canManage />);
    await screen.findByText("1 servicio requiere atención");
    expect(screen.queryByText("Recuperado")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Actualizar el panel" }));
    const erp = await screen.findByRole("link", { name: /ERP: operativo/ });
    expect(within(erp).getByText("Recuperado")).toBeInTheDocument();
    expect(within(screen.getByRole("link", { name: /Pagos: degradado/ })).getByText("Cambió")).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith("🎉 ERP se recuperó");
  });
});

describe("DashboardView modo manual (Vercel)", () => {
  it("sin modo manual no muestra el aviso", async () => {
    vi.mocked(DashboardService.get).mockResolvedValue(data);
    render(<DashboardView canManage />);
    await screen.findByText("ERP");
    expect(screen.queryByText(/Monitoreo automático no disponible/)).not.toBeInTheDocument();
  });

  it("explica la limitación y 'Verificar ahora' verifica todos y recarga el panel", async () => {
    const toast = (await import("react-hot-toast")).default;
    vi.mocked(DashboardService.get).mockResolvedValue(data);
    vi.mocked(ChecksService.runAll).mockResolvedValue({ total: 2, success: 2, failure: 0, skipped: 0, recent: 0 });
    render(<DashboardView canManage manualChecks />);
    expect(await screen.findByText(/Monitoreo automático no disponible/)).toBeInTheDocument();
    const calls = vi.mocked(DashboardService.get).mock.calls.length;

    await userEvent.click(screen.getByRole("button", { name: /Verificar ahora/ }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("2 servicios verificados: 2 OK."));
    expect(ChecksService.runAll).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(vi.mocked(DashboardService.get).mock.calls.length).toBeGreaterThan(calls));
  });
});
