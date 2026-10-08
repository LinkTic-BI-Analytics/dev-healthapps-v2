import { render, screen } from "@testing-library/react";
import RecentChecks from "./RecentChecks";

const at = (min: number) => new Date(Date.UTC(2026, 9, 5, 12, min)).toISOString();

describe("RecentChecks", () => {
  it("muestra la más reciente primero y destaca los fallos con su motivo", () => {
    render(
      <RecentChecks
        thresholdMs={500}
        checks={[
          { id: "1", checkedAt: at(0), outcome: "success", httpStatus: 200, responseTimeMs: 120, errorMessage: null },
          { id: "2", checkedAt: at(1), outcome: "failure", httpStatus: 503, responseTimeMs: 15, errorMessage: "Respondió HTTP 503." },
          { id: "3", checkedAt: at(2), outcome: "skipped", httpStatus: null, responseTimeMs: null, errorMessage: "Verificación omitida" },
        ]}
      />,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Omitida");
    expect(items[1]).toHaveTextContent("Fallo");
    expect(items[1]).toHaveTextContent("Respondió HTTP 503.");
    expect(items[1].className).toMatch(/status-down-tint/);
    expect(items[2]).toHaveTextContent("Éxito");
  });

  it("indica cuando no hay verificaciones", () => {
    render(<RecentChecks checks={[]} thresholdMs={500} />);
    expect(screen.getByText("Sin verificaciones en este rango.")).toBeInTheDocument();
  });
});
