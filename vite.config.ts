// Vite 빌드 설정: GitHub Pages 경로(base), 버전 주입, React·Tailwind·PWA 플러그인
import path from "node:path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { VitePWA } from "vite-plugin-pwa"
import pkg from "./package.json" with { type: "json" }

// GitHub Pages: https://respoflov.github.io/task/
const BASE = "/task/"

// https://vite.dev/config/
export default defineConfig({
  base: BASE,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png", "icon-512-maskable.png"],
      manifest: {
        name: "Daily Task Check",
        short_name: "Task Check",
        description: "매일의 고정 할 일을 체크하고, 기록하고, 프로젝트를 관리하는 앱",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        background_color: "#fbf9f5",
        theme_color: "#4d6152",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
