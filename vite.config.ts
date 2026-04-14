import { defineConfig } from "vitest/config";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as { version: string };

export default defineConfig({
  base: '/games/movie-mogul/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
  },
  test: {
    exclude: ['e2e/**', '.features-gen/**', '.features-gen-api/**', 'node_modules/**'],
  },
});
