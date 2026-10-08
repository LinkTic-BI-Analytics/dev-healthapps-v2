import { render, screen, within } from "@testing-library/react";
import MainLayout from "./MainLayout";
import { isActive, visibleNavItems } from "./navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/alertas" }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "system", setTheme: vi.fn() }) }));

describe("MainLayout", () => {
  it("renderiza la navegación móvil y la de escritorio con la sección activa marcada", () => {
    render(<MainLayout>contenido</MainLayout>);
    const navs = screen.getAllByRole("navigation", { name: "Navegación principal" });
    expect(navs).toHaveLength(2);
    for (const nav of navs) {
      expect(within(nav).getByRole("link", { name: "Alertas" })).toHaveAttribute("aria-current", "page");
      expect(within(nav).getByRole("link", { name: "Panel" })).not.toHaveAttribute("aria-current");
    }
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });
});

describe("isActive", () => {
  it("solo marca el panel en la raíz", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/alertas", "/")).toBe(false);
    expect(isActive("/alertas/1", "/alertas")).toBe(true);
  });
});

describe("visibleNavItems", () => {
  it("oculta las secciones que requieren un permiso que el usuario no tiene", () => {
    expect(visibleNavItems([]).map((i) => i.label)).toEqual(["Panel", "Alertas"]);
    expect(visibleNavItems(["services.read"]).map((i) => i.label)).toContain("Servicios");
    expect(visibleNavItems(["users.create"]).map((i) => i.label)).toContain("Crear usuario");
  });
});
