// @vitest-environment node
import { computeEffectivePermissions } from "./permissions";

const all = ["users.create", "users.read", "services.manage"];

describe("computeEffectivePermissions", () => {
  it("superadmin tiene todos los permisos aunque tenga revocaciones", () => {
    expect(
      computeEffectivePermissions({ role: "superadmin", rolePermissions: [], revokedPermissions: all, allPermissions: all }),
    ).toEqual([...all].sort());
  });

  it("admin tiene los de su rol menos los revocados", () => {
    expect(
      computeEffectivePermissions({
        role: "admin",
        rolePermissions: all,
        revokedPermissions: ["users.create"],
        allPermissions: all,
      }),
    ).toEqual(["services.manage", "users.read"]);
  });

  it("nuevo no tiene permisos", () => {
    expect(
      computeEffectivePermissions({ role: "nuevo", rolePermissions: [], revokedPermissions: [], allPermissions: all }),
    ).toEqual([]);
  });
});
