import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Check, Plus, X } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { buildMonthGrid } from "@/lib/calendar"
import { computeDayStats, scheduledOnceCount, tasksForDate } from "@/lib/record"
import { isFuture, isPastOrToday, todayStr, formatMonthLabel, formatDateShort, WEEKDAY_HEADER } from "@/lib/date"
import { useT, useLang, useSubtitle } from "@/lib/i18n"
import { RatioRingCell } from "@/components/RatioRingCell"
import { NONE_ICON } from "@/lib/icons"
import type { AppData } from "@/lib/types"

type Mode = "all" | "project" | "item"

export function RecordScreen() {
  const { data, isTaskCompleted, toggleCompletion, addTask, removeTask } = useAppData()
  const t = useT()
  const lang = useLang()
  const subtitle = useSubtitle("nav_record")
  const today = todayStr()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month0, setMonth0] = useState(now.getMonth())
  const [mode, setMode] = useState<Mode>("all")
  const [projectId, setProjectId] = useState<string | null>(data.projects[0]?.id ?? null)
  const [taskId, setTaskId] = useState<string | null>(data.tasks[0]?.id ?? null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const cells = useMemo(() => buildMonthGrid(year, month0), [year, month0])

  const filterFn = useMemo(() => {
    if (mode === "project" && projectId) return (task: (typeof data.tasks)[number]) => task.projectId === projectId
    return undefined
  }, [mode, projectId])

  const selectedTask = mode === "item" ? data.tasks.find((task) => task.id === taskId) : undefined

  function goMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1)
    setYear(d.getFullYear())
    setMonth0(d.getMonth())
    setSelectedDate(null)
  }

  const selectedTasks = selectedDate ? tasksForDate(data.tasks, selectedDate, filterFn) : []
  const selectedIsFuture = selectedDate ? isFuture(selectedDate) : false

  return (
    <div className="h-full overflow-y-auto px-4 pb-4 pt-1">
      <div className="relative py-1.5 pb-3">
        <div className="mb-0.5 text-[11.5px] font-medium text-ink-soft">{subtitle}</div>
        <h1 className="text-[21px] font-bold tracking-tight">{t("record_title")}</h1>
        <div className="mt-1 text-[11px] font-medium text-ink-faint">
          {mode === "item" && selectedTask
            ? selectedTask.name + (selectedTask.deletedAt ? t("record_item_deleted_suffix") : "")
            : mode === "project" && projectId
              ? data.projects.find((p) => p.id === projectId)?.name
              : t("record_all_title")}
        </div>
      </div>

      <div className="mb-3 flex rounded-[10px] bg-secondary p-[3px]">
        {(
          [
            { key: "all" as const, label: t("record_mode_all") },
            { key: "project" as const, label: t("record_mode_project") },
            { key: "item" as const, label: t("record_mode_item") },
          ]
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => {
              setMode(opt.key)
              setSelectedDate(null)
            }}
            className={`flex-1 rounded-lg py-1.5 text-[11.5px] font-bold ${
              mode === opt.key ? "bg-card text-primary shadow-sm" : "text-ink-soft"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {mode === "project" && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {data.projects.length === 0 && (
            <div className="text-[11.5px] font-medium text-ink-faint">{t("record_no_projects")}</div>
          )}
          {data.projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setProjectId(p.id)
                setSelectedDate(null)
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-bold ${
                projectId === p.id ? "bg-primary text-primary-foreground" : "bg-secondary text-ink-soft"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {mode === "item" && (
        <div className="mb-3 flex gap-1.5 overflow-x-auto pb-0.5">
          {data.tasks.length === 0 && (
            <div className="text-[11.5px] font-medium text-ink-faint">{t("record_no_tasks")}</div>
          )}
          {data.tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => {
                setTaskId(task.id)
                setSelectedDate(null)
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[10.5px] font-bold ${
                taskId === task.id ? "bg-primary text-primary-foreground" : "bg-secondary text-ink-soft"
              } ${task.deletedAt ? "opacity-60" : ""}`}
            >
              {task.name}
              {task.deletedAt ? t("record_item_deleted_suffix") : ""}
            </button>
          ))}
        </div>
      )}

      <div className="mb-3 rounded-[14px] border border-border bg-card px-2.5 py-3.5">
        <div className="mb-2.5 flex items-center justify-between px-0.5">
          <h4 className="text-[11px] font-bold text-ink-soft">{formatMonthLabel(year, month0, lang)}</h4>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => goMonth(-1)} className="flex h-6 w-6 items-center justify-center text-ink-faint">
              <ChevronLeft size={15} />
            </button>
            <button type="button" onClick={() => goMonth(1)} className="flex h-6 w-6 items-center justify-center text-ink-faint">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="mb-1.5 grid grid-cols-7">
          {WEEKDAY_HEADER[lang].map((w, i) => (
            <span
              key={w}
              className="text-center text-[9px] font-bold"
              style={{ color: i === 5 ? "var(--sat)" : i === 6 ? "var(--sun)" : "var(--ink-faint)" }}
            >
              {w}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1.5">
          {cells.map((cell) => {
            const isToday = cell.date === today
            let node: React.ReactNode

            if (!cell.inMonth) {
              node = <RatioRingCell variant={{ kind: "blank" }} />
            } else if (isFuture(cell.date)) {
              const count = mode === "all" ? scheduledOnceCount(data.tasks, cell.date) : 0
              node = (
                <RatioRingCell
                  variant={count > 0 ? { kind: "future-count", count } : { kind: "future-empty" }}
                  selected={cell.date === selectedDate}
                />
              )
            } else if (mode === "item" && selectedTask) {
              node = selectedTask.createdAt > cell.date ? (
                <RatioRingCell variant={{ kind: "blank" }} />
              ) : (
                <RatioRingCell
                  variant={{ kind: "binary", done: isTaskCompleted(selectedTask.id, cell.date) }}
                  selected={cell.date === selectedDate}
                />
              )
            } else {
              const stats = computeDayStats(data.tasks, data.completions, cell.date, filterFn)
              node =
                stats.total === 0 ? (
                  <RatioRingCell variant={{ kind: "blank" }} />
                ) : (
                  <RatioRingCell variant={{ kind: "ratio", pct: stats.pct }} selected={cell.date === selectedDate} />
                )
            }

            return (
              <button
                key={cell.date}
                type="button"
                disabled={!cell.inMonth}
                onClick={() => setSelectedDate((d) => (d === cell.date ? null : cell.date))}
                className="flex flex-col items-center gap-1"
              >
                {node}
                <span
                  className="text-[7.5px] font-semibold"
                  style={{
                    color: isToday ? "var(--primary)" : "var(--ink-faint)",
                    opacity: cell.inMonth ? 1 : 0.4,
                    fontWeight: isToday ? 800 : 600,
                  }}
                >
                  {cell.day}
                </span>
              </button>
            )
          })}
        </div>

        {mode !== "item" && (
          <div className="mt-3 flex items-center gap-3.5 border-t border-border pt-2.5">
            <Legend variant={{ kind: "future-empty" }} label={t("record_legend_0")} />
            <Legend variant={{ kind: "ratio", pct: 100 }} label={t("record_legend_100")} />
          </div>
        )}
      </div>

      {selectedDate && mode !== "item" && !selectedIsFuture && (
        <DateDetail
          key={selectedDate}
          date={selectedDate}
          tasks={selectedTasks}
          isTaskCompleted={isTaskCompleted}
          toggleCompletion={toggleCompletion}
        />
      )}

      {selectedDate && mode !== "item" && selectedIsFuture && (
        <FutureDateAdd
          key={selectedDate}
          date={selectedDate}
          projects={data.projects}
          scheduled={data.tasks.filter((task) => task.repeat.kind === "once" && task.repeat.date === selectedDate)}
          onAdd={(name, pid) =>
            addTask({ name, icon: NONE_ICON, repeat: { kind: "once", date: selectedDate }, projectId: pid })
          }
          onRemove={removeTask}
        />
      )}
    </div>
  )
}

function Legend({ variant, label }: { variant: Parameters<typeof RatioRingCell>[0]["variant"]; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[9.5px] font-semibold text-ink-soft">
      <div className="scale-[0.6] origin-left">
        <RatioRingCell variant={variant} />
      </div>
      {label}
    </div>
  )
}

function FutureDateAdd({
  date,
  projects,
  scheduled,
  onAdd,
  onRemove,
}: {
  date: string
  projects: AppData["projects"]
  scheduled: AppData["tasks"]
  onAdd: (name: string, projectId: string | null) => void
  onRemove: (taskId: string) => void
}) {
  const t = useT()
  const lang = useLang()
  const label = formatDateShort(date, lang)
  const [name, setName] = useState("")
  const [pid, setPid] = useState<string | null>(null)

  return (
    <div className="rounded-[12px] bg-secondary px-3.5 py-3">
      <div className="mb-2 text-[12px] font-bold">{label}</div>

      {scheduled.length > 0 && (
        <div className="mb-2.5 flex flex-col gap-1.5">
          {scheduled.map((task) => (
            <div key={task.id} className="flex items-center gap-2 rounded-lg bg-card px-2.5 py-1.5">
              <span className="flex-1 text-[11.5px] font-semibold">{task.name}</span>
              {task.projectId && (
                <span className="text-[9.5px] font-medium text-ink-faint">
                  {projects.find((p) => p.id === task.projectId)?.name}
                </span>
              )}
              <button type="button" onClick={() => onRemove(task.id)} className="text-ink-faint">
                <X size={13} strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("record_future_add_placeholder")}
          className="min-w-0 flex-1 rounded-lg border border-input bg-card px-2.5 py-2 text-[12px] font-semibold placeholder:font-medium placeholder:text-ink-faint focus:outline-none"
        />
        <button
          type="button"
          disabled={!name.trim()}
          onClick={() => {
            if (!name.trim()) return
            onAdd(name.trim(), pid)
            setName("")
          }}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 text-[11.5px] font-bold text-primary-foreground disabled:opacity-40"
        >
          <Plus size={13} strokeWidth={2.4} />
          {t("common_add")}
        </button>
      </div>

      {projects.length >= 2 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setPid(null)}
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
              pid === null ? "bg-primary text-primary-foreground" : "bg-card text-ink-soft"
            }`}
          >
            {t("common_none_project")}
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPid(p.id)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                pid === p.id ? "bg-primary text-primary-foreground" : "bg-card text-ink-soft"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 text-[10px] font-medium text-ink-faint">{t("record_future_add_note")}</div>
    </div>
  )
}

function DateDetail({
  date,
  tasks,
  isTaskCompleted,
  toggleCompletion,
}: {
  date: string
  tasks: ReturnType<typeof useAppData>["data"]["tasks"]
  isTaskCompleted: (taskId: string, date: string) => boolean
  toggleCompletion: (taskId: string, date: string) => void
}) {
  const t = useT()
  const lang = useLang()
  const label = formatDateShort(date, lang)
  const doneCount = tasks.filter((task) => isTaskCompleted(task.id, date)).length
  const canToggle = isPastOrToday(date)

  return (
    <div className="rounded-[12px] bg-secondary px-3.5 py-3">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[12px] font-bold">{label}</div>
        {tasks.length > 0 && (
          <span className="rounded-md bg-accent px-2 py-0.5 text-[9.5px] font-bold text-accent-foreground">
            {t("record_date_done_count", { done: doneCount, total: tasks.length })}
          </span>
        )}
      </div>
      {canToggle && tasks.length === 0 && (
        <div className="py-3 text-center text-[11.5px] font-semibold text-ink-faint">{t("record_date_empty")}</div>
      )}
      {canToggle &&
        tasks.map((task) => {
          const done = isTaskCompleted(task.id, date)
          return (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleCompletion(task.id, date)}
              className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left active:bg-card"
            >
              <span
                className={`relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                  done ? "bg-primary" : "border-[1.4px] border-input"
                }`}
              >
                {done && <Check size={10} strokeWidth={3} className="text-primary-foreground" />}
              </span>
              <span className={`flex-1 text-[12px] font-semibold ${done ? "text-ink-soft" : ""}`}>{task.name}</span>
              <span className="text-[9px] font-semibold text-ink-faint">
                {done ? t("record_tap_undo") : t("record_tap_done")}
              </span>
            </button>
          )
        })}
      {canToggle && <div className="mt-1 text-[10px] font-medium text-ink-faint">{t("record_toggle_hint")}</div>}
    </div>
  )
}
