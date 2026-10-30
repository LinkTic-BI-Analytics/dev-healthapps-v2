import "@testing-library/jest-dom/vitest";

// jsdom no implementa estas APIs; Radix (Select, DropdownMenu) las usa al abrir menús.
if (typeof window !== "undefined") {
  const proto = window.HTMLElement.prototype;
  proto.hasPointerCapture ??= () => false;
  proto.setPointerCapture ??= () => {};
  proto.releasePointerCapture ??= () => {};
  proto.scrollIntoView ??= () => {};
}
