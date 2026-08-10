import { useEffect } from "react"
import type { AppSettings } from "./types"

export function useThemeEffect(theme: AppSettings["theme"]) {
  useEffect(() => {
    const root = document.documentElement
    const mql = window.matchMedia("(prefers-color-scheme: dark)")

    const apply = () => {
      const isDark = theme === "dark" || (theme === "system" && mql.matches)
      root.classList.toggle("dark", isDark)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute("content", isDark ? "#121212" : "#4d6152")
    }

    apply()
    if (theme === "system") {
      mql.addEventListener("change", apply)
      return () => mql.removeEventListener("change", apply)
    }
  }, [theme])
}
