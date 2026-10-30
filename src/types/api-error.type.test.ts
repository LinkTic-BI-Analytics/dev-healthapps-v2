import { getErrorMessages, isApiError } from "@/types/api-error.type";

describe("isApiError", () => {
  it("reconoce un ApiError con message string o arreglo", () => {
    expect(isApiError({ message: "x", error: "Bad Request", statusCode: 400 })).toBe(true);
    expect(isApiError({ message: ["a", "b"], error: "Bad Request", statusCode: 400 })).toBe(true);
  });

  it("rechaza otros valores", () => {
    expect(isApiError(new Error("x"))).toBe(false);
    expect(isApiError(null)).toBe(false);
    expect(isApiError({ message: 1, error: "x", statusCode: 400 })).toBe(false);
    expect(isApiError({ message: "x", statusCode: 400 })).toBe(false);
  });
});

describe("getErrorMessages", () => {
  it("devuelve siempre un arreglo y descarta mensajes vacíos", () => {
    expect(getErrorMessages({ message: "uno", error: "E", statusCode: 400 })).toEqual(["uno"]);
    expect(getErrorMessages({ message: ["uno", " ", "dos"], error: "E", statusCode: 400 })).toEqual(["uno", "dos"]);
  });
});
