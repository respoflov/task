// 프로젝트에 마일스톤을 추가하는 바텀시트
import { useState } from "react"
import { BottomSheet } from "./BottomSheet"
import { useAppData } from "@/context/AppDataContext"
import { useT } from "@/lib/i18n"

// 마일스톤 제목과 목표 시점을 입력받는다
export function MilestoneAddSheet({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  projectId: string | null
}) {
  const { addMilestone } = useAppData()
  const t = useT()
  const [title, setTitle] = useState("")
  const [targetLabel, setTargetLabel] = useState("")

  const reset = () => {
    setTitle("")
    setTargetLabel("")
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
      title={t("milestone_add_title")}
      onSave={() => {
        if (!title.trim() || !projectId) return
        addMilestone({ projectId, title: title.trim(), targetLabel: targetLabel.trim() })
        reset()
        onOpenChange(false)
      }}
      saveDisabled={!title.trim()}
    >
      <div className="mb-1 mt-1 text-[11px] font-bold text-ink-soft">{t("milestone_add_name_label")}</div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t("milestone_add_name_placeholder")}
        className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[14px] font-semibold text-foreground placeholder:font-medium placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
      <div className="mb-1 mt-4 text-[11px] font-bold text-ink-soft">
        {t("milestone_add_target_label")} <span className="font-medium text-ink-faint">{t("common_optional")}</span>
      </div>
      <input
        value={targetLabel}
        onChange={(e) => setTargetLabel(e.target.value)}
        placeholder={t("milestone_add_target_placeholder")}
        className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-[14px] font-semibold text-foreground placeholder:font-medium placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ring/40"
      />
    </BottomSheet>
  )
}
