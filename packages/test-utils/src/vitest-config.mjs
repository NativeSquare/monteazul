import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Shared vitest config factory for Next.js apps using Convex and React
 * Testing Library. Pass `import.meta.url` from the calling vitest.config.ts
 * so package resolution (react-dom, @testing-library/react) happens from the
 * app's own node_modules rather than from this package.
 *
 * pnpm's hoisted layout creates several physical copies of react in the tree.
 * React requires a single instance across components, react-dom, and Testing
 * Library's act(). This factory aliases all react imports to the copy that
 * react-dom itself resolves to and forces all other node_modules through Vite
 * so they pick up that alias too.
 *
 * @param {{ importMetaUrl: string }} options
 * @returns {import("vitest/config").UserConfigExport}
 */
export function createVitestConfig(options) {
  const appRequire = createRequire(options.importMetaUrl);
  const appDir = path.dirname(fileURLToPath(options.importMetaUrl));
  const srcDir = path.join(appDir, "src");

  const reactDomRequire = createRequire(appRequire.resolve("react-dom"));
  const reactPath = path.dirname(
    reactDomRequire.resolve("react/package.json"),
  );
  const rtlPath = path.dirname(
    appRequire.resolve("@testing-library/react/package.json"),
  );

  const setupPath = fileURLToPath(new URL("./setup.ts", import.meta.url));
  const stubPath = fileURLToPath(
    new URL("./use-sync-external-store-stub.ts", import.meta.url),
  );

  return defineConfig({
    resolve: {
      alias: [
        { find: "@", replacement: srcDir },
        { find: /^react$/, replacement: path.join(reactPath, "index.js") },
        {
          find: /^react\/jsx-runtime$/,
          replacement: path.join(reactPath, "jsx-runtime.js"),
        },
        {
          find: /^react\/jsx-dev-runtime$/,
          replacement: path.join(reactPath, "jsx-dev-runtime.js"),
        },
        {
          find: /^@testing-library\/react$/,
          replacement: path.join(
            rtlPath,
            "dist/@testing-library/react.esm.js",
          ),
        },
        {
          find: /^use-sync-external-store\/shim(\/index\.js)?$/,
          replacement: stubPath,
        },
      ],
    },
    // Process all other dependencies through Vite so every react import in
    // the tree resolves through the alias above. Only react and react-dom
    // themselves stay external: they form the single native react instance
    // that everything else is redirected to.
    ssr: {
      noExternal: [
        /node_modules[\\/](?!(?:react|react-dom|scheduler)[\\/])/,
      ],
    },
    test: {
      environment: "jsdom",
      setupFiles: [setupPath],
    },
  });
}
