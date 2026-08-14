import { useEffect, useState } from "react"
import { BottomSheet } from "./BottomSheet"
import { WheelColumn, MONTH_LABEL, YEARS_BEFORE, YEARS_AFTER } from "./WheelColumn"
import { useT, useLang } from "@/lib/i18n"

export function YearMonthPicker({
  open,
  onOpenChange,
  year,
  month0,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  year: number
  month0: number
  onConfirm: (year: number, month0: number) => void
}) {
  const t = useT()
  const lang = useLang()
  const yearStart = new Date().getFullYear() - YEARS_BEFORE
  const yearCount = YEARS_BEFORE + YEARS_AFTER + 1
  const [yearIndex, setYearIndex] = useState(year - yearStart)
  const [monthIndex, setMonthIndex] = useState(month0)

  // 시트를 열 때마다 현재 보고 있는 달로 휠 위치를 다시 맞춘다.
  useEffect(() => {
    if (open) {
      setYearIndex(year - yearStart)
      setMonthIndex(month0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("record_month_picker_title")}
      onSave={() => {
        onConfirm(yearStart + yearIndex, monthIndex)
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
      </div>
    </BottomSheet>
  )
}
