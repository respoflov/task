import { toDateStr, mondayIndex } from "./date"

export interface CalendarCell {
  date: string // yyyy-mm-dd
  day: number
  inMonth: boolean
}

// 월요일 시작, 항상 6주(42칸) 그리드를 반환해 레이아웃이 달마다 흔들리지 않게 한다.
export function buildMonthGrid(year: number, month0: number): CalendarCell[] {
  const first = new Date(year, month0, 1)
  const startOffset = mondayIndex(first.getDay())
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
