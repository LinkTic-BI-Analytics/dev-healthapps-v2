import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "./ThemeToggle";

const setTheme = vi.fn();
let theme = "system";
vi.mock("next-themes", () => ({ useTheme: () => ({ theme, setTheme }) }));

describe("ThemeToggle", () => {
  it("rota entre sistema, claro y oscuro", async () => {
    theme = "system";
    const { rerender } = render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button"));
    expect(setTheme).toHaveBeenLastCalledWith("light");

    theme = "dark";
    rerender(<ThemeToggle />);
    expect(screen.getByRole("button")).toHaveAccessibleName(/Tema oscuro/);
    await userEvent.click(screen.getByRole("button"));
    expect(setTheme).toHaveBeenLastCalledWith("system");
  });
});
