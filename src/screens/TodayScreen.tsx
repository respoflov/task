import { useMemo, useState } from "react"
import { Pencil, Plus, Minus } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { NONE_ICON, getTaskIcon } from "@/lib/icons"
import { appliesToDate, isRecurring } from "@/lib/tasks"
import { formatDateLong, todayStr, WEEKDAY } from "@/lib/date"
import { useT, useLang } from "@/lib/i18n"
import { TaskAddSheet } from "@/components/TaskAddSheet"
import type { RepeatRule } from "@/lib/types"

export function TodayScreen() {
  const { data, toggleCompletion, isTaskCompleted, removeTask } = useAppData()
  const t = useT()
  const lang = useLang()
  const [addOpen, setAddOpen] = useState(false)
  const [managing, setManaging] = useState(false)
  const today = todayStr()

  const { recurring, adhoc } = useMemo(() => {
    const applicable = data.tasks
      .filter((task) => appliesToDate(task, today))
      .sort((a, b) => a.order - b.order)
    return {
      recurring: applicable.filter(isRecurring),
      adhoc: applicable.filter((task) => !isRecurring(task)),
    }
  }, [data.tasks, today])

  const doneCount = [...recurring, ...adhoc].filter((task) => isTaskCompleted(task.id, today)).length
  const totalCount = recurring.length + adhoc.length
  const showProjectLabel = data.projects.length >= 2

  const projectName = (id: string | null) =>
    id ? data.projects.find((p) => p.id === id)?.name : undefined

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
        <div className="relative py-1.5 pb-3">
          <div className="mb-0.5 text-[11.5px] font-medium text-ink-soft">{formatDateLong(today, lang)}</div>
          <h1 className="text-[21px] font-bold tracking-tight">{t("today_title")}</h1>
          {totalCount > 0 && (
            <div className="mt-1 text-[11px] font-medium text-ink-faint">
              {t("today_summary", { total: totalCount, done: doneCount })}
            </div>
          )}
          <button
            type="button"
            onClick={() => setManaging((v) => !v)}
            className="absolute right-0 top-2 flex h-7 w-7 items-center justify-center text-ink-soft"
            aria-label={t("today_manage_aria")}
          >
            <Pencil size={17} strokeWidth={1.8} />
          </button>
        </div>

        {managing && (
          <div className="mb-3 rounded-[10px] bg-accent px-3 py-2.5 text-[11.5px] font-medium leading-relaxed text-accent-foreground">
            {t("today_manage_banner")}
          </div>
        )}

        {totalCount === 0 && !managing && (
          <div className="py-10 text-center text-[12.5px] font-medium text-ink-faint">{t("today_empty")}</div>
        )}

        <TaskList
          tasks={recurring}
          today={today}
          managing={managing}
          isTaskCompleted={isTaskCompleted}
          toggleCompletion={toggleCompletion}
          removeTask={removeTask}
          showProjectLabel={showProjectLabel}
          projectName={projectName}
        />

        {!managing && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="flex w-full items-center gap-2.5 px-1 py-2.5 text-[12.5px] font-semibold text-ink-faint"
          >
            <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.4px] border-dashed border-input">
              <Plus size={13} />
            </span>
            {t("today_add_fixed")}
          </button>
        )}

        {adhoc.length > 0 && !managing && (
          <>
            <div className="mb-1 mt-4 flex items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">
                {t("today_adhoc_section")}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <TaskList
              tasks={adhoc}
              today={today}
              managing={false}
              isTaskCompleted={isTaskCompleted}
              toggleCompletion={toggleCompletion}
              removeTask={removeTask}
              showProjectLabel={showProjectLabel}
              projectName={projectName}
            />
          </>
        )}
      </div>

      <TaskAddSheet open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}

function TaskList({
  tasks,
  today,
  managing,
  isTaskCompleted,
  toggleCompletion,
  removeTask,
  showProjectLabel,
  projectName,
}: {
  tasks: ReturnType<typeof useAppData>["data"]["tasks"]
  today: string
  managing: boolean
  isTaskCompleted: (taskId: string, date: string) => boolean
  toggleCompletion: (taskId: string, date: string) => void
  removeTask: (taskId: string) => void
  showProjectLabel: boolean
  projectName: (id: string | null) => string | undefined
}) {
  const t = useT()
  const lang = useLang()
  if (tasks.length === 0) return null
  return (
    <div className="flex flex-col">
      {tasks.map((task) => {
        const hasIcon = task.icon !== NONE_ICON
        const Icon = hasIcon ? getTaskIcon(task.icon) : null
        const done = isTaskCompleted(task.id, today)
        const pName = showProjectLabel ? projectName(task.projectId) : undefined
        return (
          <div key={task.id} className="flex items-center gap-3 border-b border-border py-3 last:border-none">
            {managing && (
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white"
                aria-label={t("today_delete_aria")}
              >
                <Minus size={15} strokeWidth={2.4} />
              </button>
            )}
            {Icon && (
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-secondary">
                <Icon size={16} strokeWidth={1.7} className="text-ink-soft" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className={`text-[13.5px] font-semibold ${done ? "text-ink-faint line-through" : ""}`}>
                {task.name}
              </div>
              <div className="mt-0.5 text-[10px] font-medium text-ink-faint">
                {repeatLabel(task.repeat, t, lang)}
                {pName ? ` · ${pName}` : ""}
              </div>
            </div>
            {!managing && (
              <button
                type="button"
                onClick={() => toggleCompletion(task.id, today)}
                aria-label={done ? t("today_undone_aria") : t("today_done_aria")}
                className={`h-[22px] w-[22px] shrink-0 rounded-full border-[1.6px] ${
                  done ? "border-transparent bg-primary" : "border-input"
                } relative`}
              >
                {done && (
                  <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full p-1 text-primary-foreground">
                    <path
                      d="M5 12.5l4.5 4.5L19 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

function repeatLabel(repeat: RepeatRule, t: ReturnType<typeof useT>, lang: ReturnType<typeof useLang>): string {
  if (repeat.kind === "daily") return t("common_daily")
  if (repeat.kind === "once") return t("common_once")
  const names = WEEKDAY[lang]
  return repeat.days.map((d) => names[d]).join("·") || t("common_weekdays")
}
