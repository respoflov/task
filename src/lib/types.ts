import type { MindsetColorKey } from "./mindsetColors"

export type RepeatRule =
  | { kind: "daily" }
  | { kind: "weekdays"; days: number[] } // 0=Sun..6=Sat (Date#getDay 기준)
  | { kind: "once"; date: string } // yyyy-mm-dd, 오늘만/미래 예약 항목

export interface FixedTask {
  id: string
  name: string
  icon: string
  repeat: RepeatRule
  projectId: string | null
  createdAt: string // yyyy-mm-dd — 이 날짜 이전은 완료율 분모에서 제외
  deletedAt: string | null // yyyy-mm-dd — 이 날짜부터는 오늘 탭/미래에서 제외, 이전 기록은 보존
  order: number
  // "오늘만" 항목 추가 시점의 기기 이름표(settings.deviceLabel/deviceColor) 스냅샷.
  // 같은 동기화 코드를 여러 명이 함께 쓸 때 누가 남긴 항목인지 보여주기 위한 것으로,
  // 추가 이후에는 바뀌지 않는다(기기 이름표를 나중에 바꿔도 과거 항목은 그대로).
  authorLabel: string | null
  authorColor: MindsetColorKey | null
}

export interface Completion {
  taskId: string
  date: string // yyyy-mm-dd
}

export interface Project {
  id: string
  name: string
  startDate: string
  order: number
}

export type MilestoneStatus = "todo" | "active" | "done"

export interface Milestone {
  id: string
  projectId: string
  title: string
  status: MilestoneStatus
  targetLabel: string
  completedDate: string | null
  order: number
}

export interface MilestoneNote {
  id: string
  milestoneId: string
  date: string
  text: string
  authorLabel: string | null // FixedTask.authorLabel과 같은 개념 — 메모 작성 시점의 기기 이름표 스냅샷
  authorColor: MindsetColorKey | null
}

export interface MindsetQuote {
  id: string
  text: string
  color: MindsetColorKey // 이 문구가 뜰 때 쓰는 배경색 — 문구마다 따로 갖는다
  order: number
}

export type TodaySection = "recurring" | "adhoc"

export interface AppSettings {
  theme: "light" | "dark" | "system"
  language: "ko" | "ja" | "en"
  mindsetOrder: "random" | "sequential"
  lastMindsetShownDate: string | null
  lastSequentialIndex: number
  todaySectionOrder: TodaySection[] // ["recurring","adhoc"] 순서로 오늘 탭 섹션 배치
  weekStart: "mon" | "sun" // 기록 탭 달력이 월요일/일요일 중 어디부터 시작하는지
  landingTab: "today" | "project" | "record" // 앱을 열었을 때(진입 흐름이 끝난 뒤) 처음 보여줄 탭
  // 아래 다섯 값은 "이 기기"에만 속하는 로컬 전용 값이다 —
  // 다른 기기와 주고받는 동기화 페이로드에는 포함되지 않는다 (src/lib/sync.ts 참고).
  syncCode: string | null // 이 기기가 페어링된 동기화 코드
  syncUpdatedAt: string | null // 마지막으로 성공한 동기화 시각(ISO)
  syncIntroSeen: boolean // 최초 실행 시 동기화 안내 팝업을 봤는지
  deviceLabel: string | null // 이 기기(사람)를 나타내는 이름표 — "오늘만" 항목·프로젝트 메모에 자동으로 붙는다
  deviceColor: MindsetColorKey | null
}

export interface AppData {
  tasks: FixedTask[]
  completions: Completion[]
  projects: Project[]
  milestones: Milestone[]
  milestoneNotes: MilestoneNote[]
  mindsetQuotes: MindsetQuote[]
  settings: AppSettings
}
