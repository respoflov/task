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
}

export interface AppSettings {
  theme: "light" | "dark" | "system"
  language: "ko" | "ja" | "en"
  mindsetOrder: "random" | "sequential"
  lastMindsetShownDate: string | null
  lastSequentialIndex: number
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
