import { render, screen, within } from "@testing-library/react";
import ComponentsList from "./ComponentsList";

describe("ComponentsList", () => {
  it("agrupa los componentes, muestra los conteos y pone primero los que fallan", () => {
    render(
      <ComponentsList
        components={[
          { group: "databases", name: "default", status: "up", rawStatus: "up" },
          { group: "databases", name: "seizure", status: "down", rawStatus: "down" },
          { group: null, name: "cache", status: "up", rawStatus: "up" },
        ]}
      />,
    );
    expect(screen.getByText("2 bien")).toBeInTheDocument();
    expect(screen.getByText("1 con falla")).toBeInTheDocument();
    const dbs = screen.getByRole("heading", { name: /Bases de datos/ }).parentElement!;
    const items = within(dbs).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("seizure");
    expect(within(items[0]).getByLabelText("Con falla")).toBeInTheDocument();
    // `cache` en la raíz se agrupa como "Caché".
    expect(screen.getByRole("heading", { name: /Caché/ })).toBeInTheDocument();
  });
});

describe("ComponentsList agrupación por nombre", () => {
  it("reconoce bases de datos, caché y colas por el nombre en la raíz", () => {
    render(
      <ComponentsList
        components={[
          { group: null, name: "db_main", status: "down", rawStatus: "down", message: "No se pudo conectar a la base de datos (ECONNREFUSED)" },
          { group: null, name: "redis", status: "up", rawStatus: "up" },
          { group: null, name: "rabbitmq", status: "up", rawStatus: "up" },
          { group: null, name: "disk", status: "up", rawStatus: "up" },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: /Bases de datos/ }).parentElement).toHaveTextContent("db_main");
    expect(screen.getByText("No se pudo conectar a la base de datos (ECONNREFUSED)")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Caché/ }).parentElement).toHaveTextContent("redis");
    expect(screen.getByRole("heading", { name: /Colas/ }).parentElement).toHaveTextContent("rabbitmq");
    expect(screen.getByRole("heading", { name: /General/ }).parentElement).toHaveTextContent("disk");
  });
});
