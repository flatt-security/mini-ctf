import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), splitVendorChunkPlugin()],
  build: {
    minify: true,
    sourcemap: false,
    cssMinify: true,
    manifest: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      keepNames: false,
      minify: true,
      target: "es2018",
    },
  },
  define: {
    global: "window",
  },
});
