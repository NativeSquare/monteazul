// Test-only replacement for the `use-sync-external-store/shim` package.
// The real shim is CommonJS and natively requires its own copy of react,
// which breaks the single-react-instance requirement in tests (see
// vitest-config.ts). React 19 ships the hook natively, so re-export it.
export { useSyncExternalStore } from "react";
