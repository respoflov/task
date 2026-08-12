import type { AppData } from "./types"

const STORAGE_KEY = "daily-task-check:v1"

export function emptyData(): AppData {
  return {
    tasks: [],
    completions: [],
    projects: [],
    milestones: [],
    milestoneNotes: [],
    mindsetQuotes: [
      {
        id: "seed-1",
        text: "완벽하지 않아도 괜찮다. 하루를 건너뛰어도 다음 날 다시 시작하면 된다.",
      },
    ],
    settings: {
      theme: "system",
      language: "ko",
      mindsetOrder: "random",
      lastMindsetShownDate: null,
      lastSequentialIndex: -1,
      todaySectionOrder: ["recurring", "adhoc"],
      syncCode: null,
      syncUpdatedAt: null,
      syncIntroSeen: false,
    },
  }
}

// 이전 버전 데이터(로컬 저장소 또는 가져오기 파일 모두)에는 없던 필드를 기본값으로 보강한다.
// settings는 키 단위로 부분 병합, tasks는 항목별로 누락 필드를 채운다.
export function normalizeData(partial: Partial<AppData>): AppData {
  const base = emptyData()
  return {
    ...base,
    ...partial,
    tasks: (partial.tasks ?? base.tasks).map((t) => ({ ...t, deletedAt: t.deletedAt ?? null })),
    settings: { ...base.settings, ...partial.settings },
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyData()
    const parsed = JSON.parse(raw) as Partial<AppData>
    return normalizeData(parsed)
  } catch {
    return emptyData()
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

const REQUIRED_ARRAY_KEYS = [
  "tasks",
  "completions",
  "projects",
  "milestones",
  "milestoneNotes",
  "mindsetQuotes",
] as const

// 가져오기(import)한 JSON이 이 앱이 내보낸 형식과 맞는지 최소한으로 검증한다.
// 완벽한 스키마 검사는 아니고, "이 앱에서 나온 파일이 맞는지" 정도를 걸러낸다.
export function isValidAppData(value: unknown): value is Partial<AppData> {
  if (typeof value !== "object" || value === null) return false
  const obj = value as Record<string, unknown>
  for (const key of REQUIRED_ARRAY_KEYS) {
    if (key in obj && !Array.isArray(obj[key])) return false
  }
  if ("settings" in obj) {
    if (typeof obj.settings !== "object" || obj.settings === null) return false
    const settings = obj.settings as Record<string, unknown>
    if ("theme" in settings && !["light", "dark", "system"].includes(settings.theme as string)) return false
    if ("language" in settings && !["ko", "ja", "en"].includes(settings.language as string)) return false
  }
  // 최소 하나의 알려진 키는 있어야 "이 앱의 데이터"로 인정한다.
  return REQUIRED_ARRAY_KEYS.some((key) => key in obj) || "settings" in obj
}

export function newId(): string {
  return crypto.randomUUID()
}
