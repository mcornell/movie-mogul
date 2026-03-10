import { defineConfig } from "vite";

export default defineConfig({
  // Vite configuration options go here
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
  },
});
