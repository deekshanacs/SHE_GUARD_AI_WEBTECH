/**
 * config.ts
 *
 * Single source of truth for the API base URL.
 *
 * HOW IT WORKS:
 *  - In development (npm run dev):
 *      VITE_API_BASE_URL is not set, so this falls back to "".
 *      Vite's dev-server proxy forwards  /api/*  →  http://127.0.0.1:7860
 *      so every fetch("/api/analyze") hits your local Python server.
 *
 *  - In production (Render static site):
 *      Render injects  VITE_API_BASE_URL = "https://sheguard-api.onrender.com"
 *      at build time.  All fetch calls become absolute URLs that target the
 *      backend service directly.
 *
 * NEVER hard-code the backend URL anywhere else in the codebase.
 * Import API_BASE_URL from this file instead.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "";
