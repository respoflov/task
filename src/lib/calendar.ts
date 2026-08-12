import { toDateStr, weekStartIndex, type WeekStart } from "./date"

export interface CalendarCell {
  date: string // yyyy-mm-dd
  day: number
  inMonth: boolean
}

// 항상 6주(42칸) 그리드를 반환해 레이아웃이 달마다 흔들리지 않게 한다.
// weekStart로 월요일/일요일 중 어느 쪽부터 시작할지 정한다(기본값은 기존과 동일한 월요일).
export function buildMonthGrid(year: number, month0: number, weekStart: WeekStart = "mon"): CalendarCell[] {
  const first = new Date(year, month0, 1)
  const startOffset = weekStartIndex(first.getDay(), weekStart)
  const gridStart = new Date(year, month0, 1 - startOffset)

  const cells: CalendarCell[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    cells.push({
      date: toDateStr(d),
      day: d.getDate(),
      inMonth: d.getMonth() === month0,
    })
  }
  return cells
}
