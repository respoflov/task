import { supabase } from "./supabaseClient"
import type { AppData, AppSettings } from "./types"

// 코드→암호화 키 파생에 쓰는 고정 salt. 코드 자체가 기기 간에 공유하는 비밀이라
// salt를 비밀로 할 필요는 없다 — PBKDF2 반복 횟수가 무차별 대입을 늦추는 역할을 한다.
const SALT = new TextEncoder().encode("daily-task-check-sync-v1")
const PBKDF2_ITERATIONS = 150_000

// 0/O, 1/I/L처럼 화면에서 헷갈리는 글자는 뺐다.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

export function generateSyncCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("")
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "")
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")
}

async function deriveKey(code: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(code),
    "PBKDF2",
    false,
    ["deriveKey"]
  )
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuf(b64: string): ArrayBuffer {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer
}

// 동기화 페이로드에서 "이 기기 전용" 값(연결된 동기화 코드 자체 등)은 제외한다 —
// 그래야 다른 기기의 값을 그대로 덮어써도 이 기기의 연결 상태가 깨지지 않는다.
type SyncSettings = Omit<AppSettings, "syncCode" | "syncUpdatedAt" | "syncIntroSeen">
export type SyncPayload = Omit<AppData, "settings"> & { settings: SyncSettings }

export function toPayload(data: AppData): SyncPayload {
  const { syncCode: _syncCode, syncUpdatedAt: _syncUpdatedAt, syncIntroSeen: _syncIntroSeen, ...rest } =
    data.settings
  return { ...data, settings: rest }
}

async function encryptPayload(payload: SyncPayload, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(JSON.stringify(payload))
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain)
  return `${bufToBase64(iv.buffer)}.${bufToBase64(cipher)}`
}

async function decryptPayload(stored: string, key: CryptoKey): Promise<SyncPayload> {
  const [ivB64, cipherB64] = stored.split(".")
  const iv = new Uint8Array(base64ToBuf(ivB64))
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, base64ToBuf(cipherB64))
  return JSON.parse(new TextDecoder().decode(plain)) as SyncPayload
}

export function isSyncConfigured(): boolean {
  return supabase !== null
}

export class SyncError extends Error {}

export async function pushToCloud(code: string, data: AppData): Promise<string> {
  if (!supabase) throw new SyncError("not-configured")
  const normalized = normalizeCode(code)
  const codeHash = await sha256Hex(normalized)
  const key = await deriveKey(normalized)
  const payload = await encryptPayload(toPayload(data), key)
  const updatedAt = new Date().toISOString()
  const { error } = await supabase
    .from("sync_store")
    .upsert({ code_hash: codeHash, payload, updated_at: updatedAt }, { onConflict: "code_hash" })
  if (error) throw new SyncError(error.message)
  return updatedAt
}

// 클라우드에서 받아온 값을 그대로 반환한다 — 로컬 전용 설정(syncCode 등)과의 병합은
// 호출하는 쪽(AppDataContext)에서 처리한다.
export async function pullFromCloud(
  code: string
): Promise<{ payload: SyncPayload; updatedAt: string } | null> {
  if (!supabase) throw new SyncError("not-configured")
  const normalized = normalizeCode(code)
  const codeHash = await sha256Hex(normalized)
  const key = await deriveKey(normalized)
  const { data: row, error } = await supabase
    .from("sync_store")
    .select("payload, updated_at")
    .eq("code_hash", codeHash)
    .maybeSingle()
  if (error) throw new SyncError(error.message)
  if (!row) return null
  try {
    const payload = await decryptPayload(row.payload as string, key)
    return { payload, updatedAt: row.updated_at as string }
  } catch {
    // 코드가 틀리면 복호화가 실패한다 — 다른 코드로 올라간 데이터를 엉뚱하게 읽지 않도록 막아준다.
    throw new SyncError("decrypt-failed")
  }
}
