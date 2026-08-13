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
  // 아래 세 값은 "이 기기"의 동기화 연결 상태를 나타내는 로컬 전용 값이다 —
  // 다른 기기와 주고받는 동기화 페이로드에는 포함되지 않는다 (src/lib/sync.ts 참고).
  syncCode: string | null // 이 기기가 페어링된 동기화 코드
  syncUpdatedAt: string | null // 마지막으로 성공한 동기화 시각(ISO)
  syncIntroSeen: boolean // 최초 실행 시 동기화 안내 팝업을 봤는지
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
