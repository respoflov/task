import type { Completion, FixedTask } from "./types"
import { appliesToDate } from "./tasks"

export interface DayStats {
  total: number
  done: number
  pct: number
}

export function tasksForDate(
  tasks: FixedTask[],
  date: string,
  filter?: (t: FixedTask) => boolean
): FixedTask[] {
  return tasks.filter((t) => appliesToDate(t, date) && (!filter || filter(t)))
}

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

export function scheduledOnceCount(tasks: FixedTask[], date: string): number {
  return tasks.filter((t) => t.repeat.kind === "once" && t.repeat.date === date).length
}
