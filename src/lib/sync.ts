// 동기화 코드 방식의 기기 간 동기화: 코드에서 키를 만들어 데이터를 암호화한 뒤 Supabase에 저장한다
import { supabase } from "./supabaseClient"
import type { AppData, AppSettings } from "./types"

// 코드→암호화 키 파생에 쓰는 고정 salt. 코드 자체가 기기 간에 공유하는 비밀이라
// salt를 비밀로 할 필요는 없다 — PBKDF2 반복 횟수가 무차별 대입을 늦추는 역할을 한다.
const SALT = new TextEncoder().encode("daily-task-check-sync-v1")
const PBKDF2_ITERATIONS = 150_000

// 0/O, 1/I/L처럼 화면에서 헷갈리는 글자는 뺐다.
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"

// 8자리 동기화 코드를 새로 만든다
export function generateSyncCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => CODE_CHARS[b % CODE_CHARS.length]).join("")
}

// 입력한 코드를 공백 없는 대문자로 정리한다
function normalizeCode(code: string): string {
  return code.trim().toUpperCase().replace(/\s+/g, "")
}

// 문자열의 SHA-256 해시 (서버에는 코드 대신 이 해시만 저장한다)
async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")
}

// 코드에서 AES-GCM 암호화 키를 만든다 (PBKDF2)
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

// 바이트 배열과 base64 문자열을 서로 바꾼다
function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuf(b64: string): ArrayBuffer {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer
}

// 동기화 페이로드에서 "이 기기 전용" 값(연결된 동기화 코드, 기기 이름표 등)은 제외한다 —
// 그래야 다른 기기의 값을 그대로 덮어써도 이 기기의 연결 상태·이름표가 깨지지 않는다.
type SyncSettings = Omit<
  AppSettings,
  "syncCode" | "syncUpdatedAt" | "syncIntroSeen" | "deviceLabel" | "deviceColor"
>
// 클라우드에 올리는 데이터 모양 (기기 전용 설정은 뺀다)
export type SyncPayload = Omit<AppData, "settings"> & { settings: SyncSettings }

// 앱 데이터에서 기기 전용 설정을 빼고 올릴 데이터를 만든다
export function toPayload(data: AppData): SyncPayload {
  const {
    syncCode: _syncCode,
    syncUpdatedAt: _syncUpdatedAt,
    syncIntroSeen: _syncIntroSeen,
    deviceLabel: _deviceLabel,
    deviceColor: _deviceColor,
    ...rest
  } = data.settings
  return { ...data, settings: rest }
}

// 데이터를 암호화해 "iv.암호문" 문자열로 만든다
async function encryptPayload(payload: SyncPayload, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(JSON.stringify(payload))
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain)
  return `${bufToBase64(iv.buffer)}.${bufToBase64(cipher)}`
}

// "iv.암호문" 문자열을 복호화해 데이터로 되돌린다
async function decryptPayload(stored: string, key: CryptoKey): Promise<SyncPayload> {
  const [ivB64, cipherB64] = stored.split(".")
  const iv = new Uint8Array(base64ToBuf(ivB64))
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, base64ToBuf(cipherB64))
  return JSON.parse(new TextDecoder().decode(plain)) as SyncPayload
}

// Supabase 환경 변수가 설정돼 있는지
export function isSyncConfigured(): boolean {
  return supabase !== null
}

// 동기화 실패를 나타내는 오류
export class SyncError extends Error {}

// 현재 데이터를 암호화해 클라우드에 올리고 저장 시각을 돌려준다
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
