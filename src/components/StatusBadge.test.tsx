import { render, screen } from "@testing-library/react";
import StatusBadge from "./StatusBadge";

describe("StatusBadge", () => {
  it.each([
    ["operativo", "Operativo"],
    ["degradado", "Degradado"],
    ["caido", "Caído"],
  ] as const)("muestra el estado %s con texto, no solo color", (status, label) => {
    render(<StatusBadge status={status} />);
    const badge = screen.getByText(label);
    expect(badge).toHaveAttribute("data-status", status);
  });
});

describe("StatusBadge sin datos", () => {
  it("muestra 'Sin datos' cuando el servicio no tiene verificaciones", () => {
    render(<StatusBadge status={null} />);
    expect(screen.getByText("Sin datos")).toHaveAttribute("data-status", "none");
  });
});
