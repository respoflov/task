// 테마 설정(라이트·다크·시스템)을 문서에 적용하는 훅
import { useEffect } from "react"
import type { AppSettings } from "./types"

// 다크 여부를 html 클래스와 theme-color에 반영한다. system이면 기기 설정 변화를 따라간다
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
