import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    minify: true,
    sourcemap: false,
    cssMinify: true,
    manifest: false,
  },
  define: {
    global: "window",
  },
});
