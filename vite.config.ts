import { defineConfig } from "vite";

export default defineConfig({
  base: '/games/movie-mogul/',
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
});
