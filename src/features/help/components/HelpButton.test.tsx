import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PanelHelp from "../content/PanelHelp";
import ServiceFormHelp from "../content/ServiceFormHelp";

describe("Ayuda contextual", () => {
  it("solo se abre al hacer clic y se cierra con Escape", async () => {
    render(<PanelHelp />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Ayuda: Panel" }));
    const dialog = screen.getByRole("dialog", { name: "Panel" });
    expect(dialog).toHaveTextContent("Estados de un servicio");
    expect(dialog).toHaveTextContent("Uptime");
    expect(dialog).toHaveTextContent("cada 30 segundos");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("explica los estados con su pastilla real y los campos del formulario", async () => {
    render(<ServiceFormHelp />);
    await userEvent.click(screen.getByRole("button", { name: "Ayuda: Configurar un servicio" }));
    const dialog = screen.getByRole("dialog");
    for (const text of ["URL de verificación", "Tiempo de respuesta máximo (ms)", "Fallos consecutivos para fuera de servicio", "Frecuencia (segundos)", "Tiempo de espera (ms)", "Lectura del JSON del /health"]) {
      expect(dialog).toHaveTextContent(text);
    }
  });
});
