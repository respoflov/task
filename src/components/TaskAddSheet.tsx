import { useEffect, useState } from "react"
import { BottomSheet } from "./BottomSheet"
import { IconPicker } from "./IconPicker"
import { useAppData } from "@/context/AppDataContext"
import { TASK_ICON_KEYS } from "@/lib/icons"
import type { RepeatRule } from "@/lib/types"
import { todayStr, WEEKDAY_HEADER } from "@/lib/date"
import { useT, useLang } from "@/lib/i18n"

// WEEKDAY_HEADER는 월요일 시작(0=월..6=일) — Date#getDay() 값(0=일..6=토)으로 매핑한다.
const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0]

export function TaskAddSheet({
  open,
  onOpenChange,
  defaultMode = "daily",
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultMode?: "daily" | "weekdays" | "once"
}) {
  const { data, addTask } = useAppData()
  const t = useT()
  const lang = useLang()
  const [name, setName] = useState("")
  const [icon, setIcon] = useState(TASK_ICON_KEYS[0])
  const [mode, setMode] = useState<"daily" | "weekdays" | "once">(defaultMode)
  const [selectedDays, setSelectedDays] = useState<number[]>([])
  const [projectId, setProjectId] = useState<string | null>(null)

  const reset = () => {
    setName("")
    setIcon(TASK_ICON_KEYS[0])
    setMode(defaultMode)
    setSelectedDays([])
    setProjectId(null)
  }

  // 시트가 열릴 때마다 defaultMode를 기준으로 초기화한다 — 같은 시트 인스턴스를
  // "할 일 추가"/"오늘만 추가" 두 버튼이 서로 다른 defaultMode로 공유해서 열기 때문.
  useEffect(() => {
    if (open) reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSave = () => {
    if (!name.trim()) return
    const repeat: RepeatRule =
      mode === "daily"
        ? { kind: "daily" }
        : mode === "weekdays"
          ? { kind: "weekdays", days: selectedDays }
          : { kind: "once", date: todayStr() }
    addTask({ name: name.trim(), icon, repeat, projectId })
    reset()
    onOpenChange(false)
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title={t("task_add_title")}
      onSave={handleSave}
      saveDisabled={!name.trim() || (mode === "weekdays" && selectedDays.length === 0)}
      saveLabel={t("common_save")}
    >
      <div className="mb-1 mt-1 text-[11px] font-bold text-ink-soft">{t("task_add_name_label")}</div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("task_add_name_placeholder")}
        className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[14px] font-semibold text-foreground placeholder:font-medium placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ring/40"
      />

      <div className="mb-2 mt-4 text-[11px] font-bold text-ink-soft">{t("task_add_icon_label")}</div>
      <IconPicker value={icon} onChange={setIcon} />

      <div className="mb-2 mt-4 text-[11px] font-bold text-ink-soft">{t("task_add_repeat_label")}</div>
      <div className="flex gap-1.5">
        {[
          { key: "daily" as const, label: t("common_daily") },
          { key: "weekdays" as const, label: t("common_weekdays") },
          { key: "once" as const, label: t("common_once") },
        ].map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setMode(opt.key)}
            className={`flex-1 rounded-[10px] border-[1.4px] py-2 text-[11px] font-bold ${
              mode === opt.key
                ? "border-primary bg-accent text-primary"
                : "border-transparent bg-secondary text-ink-soft"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {mode === "weekdays" && (
        <div className="mt-2.5 flex gap-1.5">
          {WEEKDAY_HEADER[lang].map((label, i) => {
            const value = WEEKDAY_VALUES[i]
            const selected = selectedDays.includes(value)
            return (
              <button
                key={label}
                type="button"
                onClick={() =>
                  setSelectedDays((prev) =>
                    prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
                  )
                }
                className={`flex-1 rounded-[9px] py-2 text-[11px] font-bold ${
                  selected ? "bg-primary text-primary-foreground" : "bg-secondary text-ink-faint"
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>
      )}

      {mode === "once" && (
        <p className="mt-2.5 text-[10.5px] font-medium leading-relaxed text-ink-faint">{t("task_add_once_note")}</p>
      )}

      {data.projects.length >= 2 && (
        <>
          <div className="mb-2 mt-4 text-[11px] font-bold text-ink-soft">
            {t("task_add_project_label")} <span className="font-medium text-ink-faint">{t("common_optional")}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setProjectId(null)}
              className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold ${
                projectId === null ? "bg-primary text-primary-foreground" : "bg-secondary text-ink-soft"
              }`}
            >
              {t("common_none_project")}
            </button>
            {data.projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProjectId(p.id)}
                className={`rounded-full px-3 py-1.5 text-[10.5px] font-semibold ${
                  projectId === p.id ? "bg-primary text-primary-foreground" : "bg-secondary text-ink-soft"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}
    </BottomSheet>
  )
}
