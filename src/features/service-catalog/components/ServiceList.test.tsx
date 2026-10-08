import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServiceList from "./ServiceList";
import { ServiceCatalogService } from "../services/service-catalog.service";

vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../services/service-catalog.service", () => ({
  ServiceCatalogService: { getAll: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

const svc = {
  id: "1",
  name: "API de Pagos",
  description: null,
  checkUrl: "https://pagos/health",
  isActive: true,
  degradedResponseTimeMs: 1000,
  downAfterFailures: 3,
  checkIntervalSeconds: 60,
  timeoutMs: 10000,
  createdAt: "",
  updatedAt: "",
};

describe("ServiceList", () => {
  it("muestra el estado vacío con la acción de registrar", async () => {
    vi.mocked(ServiceCatalogService.getAll).mockResolvedValue([]);
    render(<ServiceList canManage />);
    expect(await screen.findByText("Aún no hay servicios registrados")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Registrar servicio/ })).toHaveAttribute("href", "/servicios/nuevo");
  });

  it("desactiva un servicio desde el interruptor", async () => {
    vi.mocked(ServiceCatalogService.getAll).mockResolvedValue([svc]);
    vi.mocked(ServiceCatalogService.update).mockResolvedValue({ ...svc, isActive: false });
    render(<ServiceList canManage />);
    const [toggle] = await screen.findAllByRole("switch", { name: "Desactivar API de Pagos" });
    await userEvent.click(toggle);
    expect(ServiceCatalogService.update).toHaveBeenCalledWith("1", { isActive: false });
    expect((await screen.findAllByText("Inactivo")).length).toBeGreaterThan(0);
  });

  it("sin permiso de gestión no muestra acciones", async () => {
    vi.mocked(ServiceCatalogService.getAll).mockResolvedValue([svc]);
    render(<ServiceList canManage={false} />);
    await screen.findAllByText("API de Pagos");
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });
});

describe("ServiceList eliminar (WI-022)", () => {
  it("cancelar el diálogo no elimina nada", async () => {
    vi.mocked(ServiceCatalogService.getAll).mockResolvedValue([svc]);
    render(<ServiceList canManage />);
    const [button] = await screen.findAllByRole("button", { name: "Eliminar API de Pagos" });
    await userEvent.click(button);
    expect(screen.getByRole("alertdialog")).toHaveTextContent('¿Eliminar "API de Pagos"?');
    expect(screen.getByRole("alertdialog")).toHaveTextContent("no se puede deshacer");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(ServiceCatalogService.remove).not.toHaveBeenCalled();
    expect(screen.getAllByText("API de Pagos").length).toBeGreaterThan(0);
  });

  it("confirmar elimina el servicio y lo quita del listado", async () => {
    vi.mocked(ServiceCatalogService.getAll).mockResolvedValue([svc]);
    vi.mocked(ServiceCatalogService.remove).mockResolvedValue(undefined);
    render(<ServiceList canManage />);
    const [button] = await screen.findAllByRole("button", { name: "Eliminar API de Pagos" });
    await userEvent.click(button);
    await userEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    expect(ServiceCatalogService.remove).toHaveBeenCalledWith("1");
    expect(await screen.findByText("Aún no hay servicios registrados")).toBeInTheDocument();
  });
});
