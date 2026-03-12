import { defineConfig } from "vite";

export default defineConfig({
  base: '/games/movie-mogul/',
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
  },
});
