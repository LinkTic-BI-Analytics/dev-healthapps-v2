import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateUserForm from "./CreateUserForm";
import { UserService } from "../services/user.service";

vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../services/user.service", () => ({ UserService: { create: vi.fn() } }));

describe("CreateUserForm", () => {
  it("un admin no ve la opción superadmin", async () => {
    render(<CreateUserForm assignableRoles={["admin", "nuevo"]} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Rol" }));
    expect(screen.getByRole("option", { name: "Admin" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Superadmin" })).not.toBeInTheDocument();
  });

  it("crea el usuario con los datos normalizados y limpia el formulario", async () => {
    vi.mocked(UserService.create).mockResolvedValue({ id: "1", email: "n@b.co", username: "nuevo1", role: "nuevo" });
    render(<CreateUserForm assignableRoles={["superadmin", "admin", "nuevo"]} />);
    await userEvent.type(screen.getByLabelText("Email"), "N@B.co");
    await userEvent.type(screen.getByLabelText("Nombre de usuario"), "Nuevo1");
    await userEvent.type(screen.getByLabelText("Contraseña"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Crear usuario" }));
    expect(UserService.create).toHaveBeenCalledWith({ email: "n@b.co", username: "nuevo1", password: "x", role: "nuevo" });
    expect(screen.getByLabelText("Email")).toHaveValue("");
  });
});
