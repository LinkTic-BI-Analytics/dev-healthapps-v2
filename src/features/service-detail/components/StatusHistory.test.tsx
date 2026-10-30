import { render, screen } from "@testing-library/react";
import StatusHistory from "./StatusHistory";

describe("StatusHistory", () => {
  it("muestra las transiciones en el orden recibido (más reciente primero) con estado anterior y nuevo", () => {
    render(
      <StatusHistory
        now={new Date("2026-10-05T12:00:00Z")}
        changes={[
          { id: "2", fromStatus: "caido", toStatus: "operativo", changedAt: "2026-10-05T11:55:00Z" },
          { id: "1", fromStatus: null, toStatus: "caido", changedAt: "2026-10-05T11:00:00Z" },
        ]}
      />,
    );
    const [recovery, initial] = screen.getAllByRole("listitem");
    expect(recovery).toHaveTextContent(/Caído.*Operativo/);
    expect(recovery).toHaveTextContent("hace 5 minutos");
    expect(initial).toHaveTextContent(/Inicio.*Caído/);
  });

  it("indica cuando no hay cambios", () => {
    render(<StatusHistory changes={[]} now={new Date()} />);
    expect(screen.getByText("Todavía no hay cambios de estado.")).toBeInTheDocument();
  });
});
