// 기록 탭 통계 계산
import type { Completion, FixedTask } from "./types"
import { appliesToDate } from "./tasks"

// 하루의 전체 할 일 수·완료 수·완료율
export interface DayStats {
  total: number
  done: number
  pct: number
}

// 그 날짜에 적용되는 할 일만 고른다 (필터를 주면 한 번 더 거른다)
export function tasksForDate(
  tasks: FixedTask[],
  date: string,
  filter?: (t: FixedTask) => boolean
): FixedTask[] {
  return tasks.filter((t) => appliesToDate(t, date) && (!filter || filter(t)))
}

// 그 날짜의 완료 통계를 계산한다
export function computeDayStats(
  tasks: FixedTask[],
  completions: Completion[],
  date: string,
  filter?: (t: FixedTask) => boolean
): DayStats {
  const applicable = tasksForDate(tasks, date, filter)
  const total = applicable.length
  const done = applicable.filter((t) =>
    completions.some((c) => c.taskId === t.id && c.date === date)
  ).length
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 }
}

// 그 날짜에 잡힌 "하루만" 할 일 개수 (미래 날짜 표시용)
export function scheduledOnceCount(tasks: FixedTask[], date: string): number {
  return tasks.filter((t) => t.repeat.kind === "once" && t.repeat.date === date).length
}
