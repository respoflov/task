// 프로젝트 탭: 프로젝트 전환 탭과 마일스톤 스테퍼
import { useState } from "react"
import { Check, Plus } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { ProjectCreateSheet } from "@/components/ProjectCreateSheet"
import { MilestoneAddSheet } from "@/components/MilestoneAddSheet"
import { useT, useLang, useSubtitle } from "@/lib/i18n"
import { formatMonthDay } from "@/lib/date"
import { mindsetBgVar } from "@/lib/mindsetColors"
import type { Milestone } from "@/lib/types"

// 프로젝트 탭 본체
export function ProjectScreen() {
  const { data } = useAppData()
  const t = useT()
  const subtitle = useSubtitle("nav_project")
  const [activeProjectId, setActiveProjectId] = useState<string | null>(data.projects[0]?.id ?? null)
  const [createOpen, setCreateOpen] = useState(false)
  const [milestoneOpen, setMilestoneOpen] = useState(false)

  const project = data.projects.find((p) => p.id === activeProjectId) ?? data.projects[0]
  const milestones = project
    ? data.milestones.filter((m) => m.projectId === project.id).sort((a, b) => a.order - b.order)
    : []

  return (
    <div className="h-full overflow-y-auto px-4 pb-4 pt-1">
      <div className="relative py-1.5 pb-3">
        <div className="mb-0.5 text-[11.5px] font-medium text-ink-soft">{subtitle}</div>
        <h1 className="text-[21px] font-bold tracking-tight">{t("project_title")}</h1>
      </div>

      <div className="mb-2 flex gap-1.5 overflow-x-auto pb-0.5">
        {data.projects.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveProjectId(p.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11.5px] font-bold ${
              project?.id === p.id ? "bg-primary text-primary-foreground" : "bg-secondary text-ink-soft"
            }`}
          >
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="shrink-0 rounded-full border-[1.4px] border-dashed border-input px-3.5 py-1.5 text-[11.5px] font-bold text-ink-faint"
        >
          {t("project_new")}
        </button>
      </div>

      {!project && (
        <div className="mt-6 rounded-2xl border border-dashed border-input px-4 py-10 text-center text-[12px] font-medium leading-relaxed text-ink-faint">
          {t("project_empty")}
        </div>
      )}

      {project && (
        <>
          <div className="mb-1 text-[11px] font-medium text-ink-faint">
            {project.startDate.replaceAll("-", ". ")}. {t("project_started")}
          </div>

          <div className="relative mt-2">
            {milestones.map((m, i) => (
              <MilestoneRow key={m.id} milestone={m} isLast={i === milestones.length - 1} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMilestoneOpen(true)}
            className="mt-1 flex items-center gap-2 py-2 pl-8 text-[11.5px] font-semibold text-ink-faint"
          >
            <Plus size={14} strokeWidth={2} />
            {t("project_add_milestone")}
          </button>
        </>
      )}

      <ProjectCreateSheet open={createOpen} onOpenChange={setCreateOpen} onCreated={setActiveProjectId} />
      <MilestoneAddSheet open={milestoneOpen} onOpenChange={setMilestoneOpen} projectId={project?.id ?? null} />
    </div>
  )
}

// 마일스톤 한 단계 (상태 전환과 메모)
function MilestoneRow({ milestone, isLast }: { milestone: Milestone; isLast: boolean }) {
  const { data, setMilestoneStatus, addMilestoneNote } = useAppData()
  const t = useT()
  const lang = useLang()
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const notes = data.milestoneNotes
    .filter((n) => n.milestoneId === milestone.id)
    .sort((a, b) => (a.date < b.date ? -1 : 1))

  const statusLabel =
    milestone.status === "done"
      ? milestone.completedDate
        ? t("project_status_done_with_date", { date: milestone.completedDate.slice(5).replace("-", "/") })
        : t("project_status_done")
      : milestone.status === "active"
        ? t("project_status_active")
        : milestone.targetLabel
          ? t("project_status_todo_with_target", { target: milestone.targetLabel })
          : t("project_status_todo")

  return (
    <div className="relative">
      {!isLast && <div className="absolute bottom-[-2px] left-[15px] top-8 w-[1.6px] bg-input" />}
      <div className="flex gap-2.5 py-2.5">
        <div
          className={`relative z-10 mt-0.5 flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full text-[10.5px] font-bold ${
            milestone.status === "done"
              ? "bg-primary text-primary-foreground"
              : milestone.status === "active"
                ? "border-[1.6px] border-primary text-primary bg-background"
                : "border-[1.6px] border-input text-ink-faint bg-background"
          }`}
        >
          {milestone.status === "done" ? <Check size={12} strokeWidth={3} /> : milestone.order + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[13px] font-bold ${milestone.status === "active" ? "text-primary" : ""}`}>
            {milestone.title}
          </div>
          {notes.length > 0 && (
            <div className="mt-0.5 text-[10px] font-medium text-ink-faint">
              {t("project_notes_count", { n: notes.length })}
            </div>
          )}
          <span
            className={`mt-1.5 inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
              milestone.status === "active" ? "bg-accent text-accent-foreground" : "bg-secondary text-ink-faint"
            }`}
          >
            {statusLabel}
          </span>

          {milestone.status === "active" && (
            <div className="ml-0.5 mt-2 flex flex-col gap-2 border-l-[1.4px] border-border pl-3.5">
              {notes.map((n) => (
                <div key={n.id}>
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-ink-soft">
                    <span>{formatMonthDay(n.date, lang)}</span>
                    {n.authorLabel && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-faint">
                        <span
                          className="h-[6px] w-[6px] shrink-0 rounded-full"
                          style={{ background: mindsetBgVar(n.authorColor ?? "terracotta") }}
                        />
                        {n.authorLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-medium leading-relaxed">{n.text}</div>
                </div>
              ))}

              {noteOpen ? (
                <div className="flex flex-col gap-1.5">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={t("project_note_placeholder")}
                    rows={2}
                    className="rounded-lg border border-input bg-card px-2.5 py-2 text-[11px] font-medium placeholder:text-ink-faint focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!noteText.trim()) return
                      addMilestoneNote(milestone.id, noteText.trim())
                      setNoteText("")
                      setNoteOpen(false)
                    }}
                    className="self-start text-[10.5px] font-bold text-primary"
                  >
                    {t("project_note_save")}
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setNoteOpen(true)} className="self-start text-[11px] font-bold text-primary">
                  {t("project_add_note")}
                </button>
              )}

              <button
                type="button"
                onClick={() => setMilestoneStatus(milestone.id, "done")}
                className="mt-1 flex w-fit items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-bold text-primary-foreground"
              >
                <Check size={12} strokeWidth={2.6} />
                {t("project_complete_milestone")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
