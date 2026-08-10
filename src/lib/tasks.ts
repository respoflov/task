import type { FixedTask } from "./types"

// 해당 날짜에 이 항목이 "오늘의 할 일" 목록에 나타나야 하는지.
// createdAt 이전 날짜에는 절대 나타나지 않는다 (도중에 추가한 항목이 과거 완료율에 영향을 주지 않기 위함).
export function appliesToDate(task: FixedTask, dateStr: string): boolean {
  if (dateStr < task.createdAt) return false
  const d = new Date(dateStr + "T00:00:00")
  switch (task.repeat.kind) {
    case "daily":
      return true
    case "weekdays":
      return task.repeat.days.includes(d.getDay())
    case "once":
      return task.repeat.date === dateStr
  }
}

export function isRecurring(task: FixedTask): boolean {
  return task.repeat.kind !== "once"
}
