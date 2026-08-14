import { useEffect, useRef } from "react"
import type { Lang } from "@/lib/i18n"

export const ITEM_H = 44
const VISIBLE_COUNT = 5
export const WHEEL_H = ITEM_H * VISIBLE_COUNT
const PAD = (WHEEL_H - ITEM_H) / 2
export const YEARS_BEFORE = 10
export const YEARS_AFTER = 10

export const MONTH_LABEL: Record<Lang, string[]> = {
  ko: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  ja: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
}

// 세로 스크롤 + scroll-snap으로 만든 휠 하나. 브라우저의 관성 스크롤을 그대로 쓰고,
// 직접 드래그 물리를 구현하지 않는다 — 스크롤이 멎으면(120ms 디바운스) 가운데 온 항목을 확정한다.
// 년/월(YearMonthPicker)과 년/월/일(DatePicker)이 함께 쓰는 공용 컴포넌트.
export function WheelColumn({
  count,
  index,
  onSettle,
  renderLabel,
}: {
  count: number
  index: number
  onSettle: (i: number) => void
  renderLabel: (i: number) => string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = index * ITEM_H
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleScroll() {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      const el = ref.current
      if (!el) return
      const i = Math.max(0, Math.min(count - 1, Math.round(el.scrollTop / ITEM_H)))
      onSettle(i)
    }, 120)
  }

  function jumpTo(i: number) {
    ref.current?.scrollTo({ top: i * ITEM_H, behavior: "smooth" })
  }

  return (
    <div className="relative flex-1" style={{ height: WHEEL_H }}>
      <div className="pointer-events-none absolute inset-x-1 z-0 rounded-lg bg-secondary" style={{ top: PAD, height: ITEM_H }} />
      <div
        ref={ref}
        onScroll={handleScroll}
        className="no-scrollbar relative z-10 h-full overflow-y-scroll"
        style={{ paddingTop: PAD, paddingBottom: PAD, scrollSnapType: "y mandatory" }}
      >
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => jumpTo(i)}
            className="flex w-full items-center justify-center text-[15px]"
            style={{
              height: ITEM_H,
              scrollSnapAlign: "center",
              fontWeight: i === index ? 800 : 600,
              opacity: i === index ? 1 : 0.38,
              color: i === index ? "var(--foreground)" : "var(--ink-faint)",
            }}
          >
            {renderLabel(i)}
          </button>
        ))}
      </div>
    </div>
  )
}
