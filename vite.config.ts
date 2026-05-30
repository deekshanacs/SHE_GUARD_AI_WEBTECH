import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // In development, forward /api/* to the local FastAPI server.
      // This proxy is ONLY active when running `npm run dev`.
      // In the production Render build it is ignored entirely —
      // VITE_API_BASE_URL provides the absolute backend URL instead.
      "/api": {
        target: "http://127.0.0.1:7860",
        changeOrigin: true,
        // rewrite not needed — FastAPI also mounts routes under /api
      },
    },
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Expose VITE_API_BASE_URL to client bundle at build time.
  // Vite only exposes variables prefixed with VITE_ by default.
  define:
    mode === "production"
      ? {}
      : {
          // In dev, make sure any accidental reference to the var is ""
          "import.meta.env.VITE_API_BASE_URL": JSON.stringify(""),
        },
}));
