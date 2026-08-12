import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// 아직 Supabase 프로젝트가 연결되지 않았으면 null — 동기화 기능 전체가 비활성 상태로 동작한다.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
