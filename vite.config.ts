import { defineConfig } from "vitest/config";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as { version: string };

export default defineConfig({
  base: process.env.VITE_SCORES_API ? '/' : '/games/movie-mogul/',
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
    coverage: {
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',        // full game loop, covered by E2E tests
        'src/utils/index.ts', // arithmetic stubs, not used by game
        'src/env.d.ts',
        'src/vite-env.d.ts',
      ],
    },
  },
});
