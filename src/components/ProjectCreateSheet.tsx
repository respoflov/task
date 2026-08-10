import { useState } from "react"
import { BottomSheet } from "./BottomSheet"
import { useAppData } from "@/context/AppDataContext"
import { todayStr } from "@/lib/date"
import { useT } from "@/lib/i18n"

export function ProjectCreateSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: (projectId: string) => void
}) {
  const { addProject } = useAppData()
  const t = useT()
  const [name, setName] = useState("")

  const reset = () => setName("")

  return (
    <BottomSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title={t("project_create_title")}
      onSave={() => {
        if (!name.trim()) return
        const id = addProject({ name: name.trim(), startDate: todayStr() })
        reset()
        onOpenChange(false)
        onCreated(id)
      }}
      saveDisabled={!name.trim()}
    >
      <div className="mb-1 mt-1 text-[11px] font-bold text-ink-soft">{t("project_create_name_label")}</div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("project_create_name_placeholder")}
        className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[14px] font-semibold text-foreground placeholder:font-medium placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
      <div className="mb-1 mt-4 text-[11px] font-bold text-ink-soft">{t("project_create_start_label")}</div>
      <div className="rounded-xl border border-input bg-card px-3.5 py-2.5 text-[14px] font-semibold text-ink-faint">
        {todayStr().replaceAll("-", ". ")}.
      </div>
      <p className="mt-2 text-[10px] font-medium leading-relaxed text-ink-faint">{t("project_create_note")}</p>
    </BottomSheet>
  )
}
