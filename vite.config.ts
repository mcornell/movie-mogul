import { defineConfig } from "vitest/config";

export default defineConfig({
  base: '/games/movie-mogul/',
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
  },
  test: {
    exclude: ['e2e/**', '.features-gen/**', 'node_modules/**'],
  },
});
