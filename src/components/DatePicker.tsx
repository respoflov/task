import { useEffect, useState } from "react"
import { BottomSheet } from "./BottomSheet"
import { WheelColumn, MONTH_LABEL, YEARS_BEFORE, YEARS_AFTER } from "./WheelColumn"
import { toDateStr } from "@/lib/date"
import { useT, useLang } from "@/lib/i18n"

// 년/월/일 휠 3개로 임의의 날짜 하나를 고르는 시트. YearMonthPicker(년/월 이동)와 달리
// 실제 yyyy-mm-dd 하나를 값으로 주고받는다 — 프로젝트 시작일처럼 "그 날짜 자체"가 필요할 때 쓴다.
export function DatePicker({
  open,
  onOpenChange,
  value,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  value: string // yyyy-mm-dd
  onConfirm: (dateStr: string) => void
}) {
  const t = useT()
  const lang = useLang()
  const yearStart = new Date().getFullYear() - YEARS_BEFORE
  const yearCount = YEARS_BEFORE + YEARS_AFTER + 1
  const [y, m, d] = value.split("-").map(Number)
  const [yearIndex, setYearIndex] = useState(y - yearStart)
  const [monthIndex, setMonthIndex] = useState(m - 1)
  const [dayIndex, setDayIndex] = useState(d - 1)

  useEffect(() => {
    if (open) {
      const [yy, mm, dd] = value.split("-").map(Number)
      setYearIndex(yy - yearStart)
      setMonthIndex(mm - 1)
      setDayIndex(dd - 1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // 월/년이 바뀌어 그 달의 일수보다 dayIndex가 커진 경우(예: 1월 31일 → 2월)는
  // 휠을 강제로 되감지 않고, 저장 시점에만 그 달의 마지막 날로 자연스럽게 clamp한다.
  const daysInMonth = new Date(yearStart + yearIndex, monthIndex + 1, 0).getDate()

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("date_picker_title")}
      onSave={() => {
        const day = Math.min(dayIndex + 1, daysInMonth)
        onConfirm(toDateStr(new Date(yearStart + yearIndex, monthIndex, day)))
        onOpenChange(false)
      }}
      saveLabel={t("common_save")}
    >
      <div className="flex gap-2 pb-2 pt-1">
        <WheelColumn
          count={yearCount}
          index={yearIndex}
          onSettle={setYearIndex}
          renderLabel={(i) => t("record_month_picker_year", { year: yearStart + i })}
        />
        <WheelColumn count={12} index={monthIndex} onSettle={setMonthIndex} renderLabel={(i) => MONTH_LABEL[lang][i]} />
        <WheelColumn
          count={daysInMonth}
          index={Math.min(dayIndex, daysInMonth - 1)}
          onSettle={setDayIndex}
          renderLabel={(i) => t("date_picker_day", { day: i + 1 })}
        />
      </div>
    </BottomSheet>
  )
}
