import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest runs without injected globals (`globals: false`), so
// @testing-library/react cannot register its own act() environment or
// auto-cleanup. Do both manually.
declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// jsdom does not implement window.matchMedia, which is used by the
// `useIsMobile` hook (and therefore by any component rendered inside
// `SidebarProvider`). Provide a minimal desktop-style stub.
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
});
