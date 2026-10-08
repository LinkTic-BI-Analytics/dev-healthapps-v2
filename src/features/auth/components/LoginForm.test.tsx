import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";
import { AuthService } from "../services/auth.service";

const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh }) }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
vi.mock("../services/auth.service", () => ({ AuthService: { login: vi.fn() } }));

describe("LoginForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("valida los campos vacíos sin llamar al API", async () => {
    render(<LoginForm callbackUrl="/" />);
    await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(await screen.findByText("Ingresa tu email o usuario.")).toBeInTheDocument();
    expect(screen.getByLabelText("Email o usuario")).toHaveAttribute("aria-invalid", "true");
    expect(AuthService.login).not.toHaveBeenCalled();
  });

  it("inicia sesión con el username y vuelve a callbackUrl", async () => {
    vi.mocked(AuthService.login).mockResolvedValue({
      id: "1",
      email: "a@b.co",
      username: "ana",
      role: "admin",
      permissions: [],
    });
    render(<LoginForm callbackUrl="/alertas" />);
    await userEvent.type(screen.getByLabelText("Email o usuario"), "Ana");
    await userEvent.type(screen.getByLabelText("Contraseña"), "x");
    await userEvent.click(screen.getByRole("button", { name: "Iniciar sesión" }));
    expect(AuthService.login).toHaveBeenCalledWith({ identifier: "ana", password: "x" });
    expect(replace).toHaveBeenCalledWith("/alertas");
    expect(refresh).toHaveBeenCalled();
  });

  it("muestra el aviso de sesión expirada", () => {
    render(<LoginForm callbackUrl="/" expired />);
    expect(screen.getByRole("status")).toHaveTextContent("Tu sesión expiró");
  });
});
