/// <reference types="vite/client" />

declare const __APP_VERSION__: string

// 빌드 때 주입되는 환경 변수 타입 (Supabase URL·키)
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
