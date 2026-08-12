import { Fragment, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { ChevronDown, GripVertical, Plus } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { NONE_ICON, getTaskIcon } from "@/lib/icons"
import { appliesToDate, isRecurring } from "@/lib/tasks"
import { formatDateLong, todayStr, WEEKDAY } from "@/lib/date"
import { useT, useLang } from "@/lib/i18n"
import { TaskAddSheet } from "@/components/TaskAddSheet"
import { BottomSheet } from "@/components/BottomSheet"
import { IconPicker } from "@/components/IconPicker"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import type { FixedTask, RepeatRule, TodaySection } from "@/lib/types"

const SECTION_GAP = 12 // px — 섹션 사이 margin-bottom(mb-3)과 맞춘 값. 드래그 시 자리 계산에 쓰인다.

export function TodayScreen() {
  const { data, toggleCompletion, isTaskCompleted, removeTask, updateTask, updateSettings } = useAppData()
  const t = useT()
  const lang = useLang()
  const today = todayStr()

  const [addOpen, setAddOpen] = useState(false)
  const [addDefaultMode, setAddDefaultMode] = useState<"daily" | "once">("daily")
  const [collapsed, setCollapsed] = useState<Record<TodaySection, boolean>>({ recurring: false, adhoc: false })
  const [deleteTarget, setDeleteTarget] = useState<FixedTask | null>(null)
  const [iconEditTarget, setIconEditTarget] = useState<FixedTask | null>(null)

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

  const projectName = (id: string | null) => (id ? data.projects.find((p) => p.id === id)?.name : undefined)

  const order = data.settings.todaySectionOrder
  const reorder = useSectionReorder(order, (next) => updateSettings({ todaySectionOrder: next }))

  function openAdd(mode: "daily" | "once") {
    setAddDefaultMode(mode)
    setAddOpen(true)
  }

  function toggleCollapse(key: TodaySection) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const sectionProps = {
    today,
    isTaskCompleted,
    toggleCompletion,
    updateTask,
    showProjectLabel,
    projectName,
    onRequestDelete: setDeleteTarget,
    onRequestIconChange: setIconEditTarget,
  }

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
        </div>

        <button
          type="button"
          onClick={() => openAdd("daily")}
          className="mb-3 flex w-full items-center gap-2.5 px-1 py-2.5 text-[12.5px] font-semibold text-ink-faint"
        >
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full border-[1.4px] border-dashed border-input">
            <Plus size={13} />
          </span>
          {t("today_add_task")}
        </button>

        <div className="mb-3 border-t border-dashed border-border" />

        {totalCount === 0 && (
          <div className="py-10 text-center text-[12.5px] font-medium text-ink-faint">{t("today_empty")}</div>
        )}

        {order.map((key, index) => (
          <Fragment key={key}>
            <div
              ref={(el) => {
                reorder.elRefs.current[key] = el
              }}
              style={reorder.styleFor(key)}
              className="mb-3"
            >
              <div className="mb-1 flex items-center gap-1">
                <button
                  type="button"
                  onPointerDown={(e) => reorder.handlePointerDown(key, e)}
                  onPointerMove={reorder.handlePointerMove}
                  onPointerUp={reorder.handlePointerUp}
                  onPointerCancel={reorder.handlePointerUp}
                  aria-label={t("today_reorder_aria")}
                  className="flex h-6 w-6 shrink-0 touch-none items-center justify-center text-ink-faint"
                >
                  <GripVertical size={14} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => toggleCollapse(key)}
                  className="flex flex-1 items-center gap-1 py-0.5 text-left"
                >
                  <ChevronDown
                    size={12}
                    strokeWidth={2.4}
                    className={`text-ink-faint transition-transform ${collapsed[key] ? "-rotate-90" : ""}`}
                  />
                  <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">
                    {key === "recurring" ? t("today_section_recurring") : t("today_adhoc_section")}
                  </span>
                </button>
                {key === "adhoc" && (
                  <button
                    type="button"
                    onClick={() => openAdd("once")}
                    aria-label={t("today_add_adhoc_aria")}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-soft"
                  >
                    <Plus size={14} strokeWidth={2.2} />
                  </button>
                )}
              </div>

              {!collapsed[key] &&
                (key === "recurring" ? (
                  <TaskList tasks={recurring} {...sectionProps} />
                ) : (
                  <>
                    <TaskList tasks={adhoc} {...sectionProps} />
                    {adhoc.length === 0 && (
                      <div className="px-1 py-2 text-[11px] font-medium text-ink-faint">{t("today_adhoc_empty")}</div>
                    )}
                  </>
                ))}
            </div>
            {index === 0 && <div className="mb-3 border-t border-dashed border-border" />}
          </Fragment>
        ))}
      </div>

      <TaskAddSheet open={addOpen} onOpenChange={setAddOpen} defaultMode={addDefaultMode} />

      {iconEditTarget && (
        <BottomSheet
          open
          onOpenChange={(v) => !v && setIconEditTarget(null)}
          title={t("today_change_icon_title")}
        >
          <IconPicker
            value={iconEditTarget.icon}
            onChange={(icon) => {
              updateTask(iconEditTarget.id, { icon })
              setIconEditTarget(null)
            }}
          />
        </BottomSheet>
      )}

      {deleteTarget && (
        <Dialog open onOpenChange={(v) => !v && setDeleteTarget(null)}>
          <DialogContent showCloseButton={false} className="rounded-[16px] border border-border bg-card p-4 ring-0">
            <DialogTitle className="text-[14px] font-bold text-foreground">
              {t("today_delete_confirm_title")}
            </DialogTitle>
            <DialogDescription className="text-[11.5px] font-medium leading-relaxed text-ink-soft">
              {t("today_delete_confirm_body", { name: deleteTarget.name })}
            </DialogDescription>
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg bg-secondary px-3.5 py-1.5 text-[11.5px] font-bold text-ink-soft"
              >
                {t("common_cancel")}
              </button>
              <button
                type="button"
                onClick={() => {
                  removeTask(deleteTarget.id)
                  setDeleteTarget(null)
                }}
                className="rounded-lg bg-destructive px-3.5 py-1.5 text-[11.5px] font-bold text-white"
              >
                {t("common_delete")}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function TaskList({
  tasks,
  today,
  isTaskCompleted,
  toggleCompletion,
  updateTask,
  showProjectLabel,
  projectName,
  onRequestDelete,
  onRequestIconChange,
}: {
  tasks: FixedTask[]
  today: string
  isTaskCompleted: (taskId: string, date: string) => boolean
  toggleCompletion: (taskId: string, date: string) => void
  updateTask: (taskId: string, patch: Partial<Pick<FixedTask, "name" | "icon">>) => void
  showProjectLabel: boolean
  projectName: (id: string | null) => string | undefined
  onRequestDelete: (task: FixedTask) => void
  onRequestIconChange: (task: FixedTask) => void
}) {
  if (tasks.length === 0) return null
  return (
    <div className="flex flex-col">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          today={today}
          isTaskCompleted={isTaskCompleted}
          toggleCompletion={toggleCompletion}
          updateTask={updateTask}
          pName={showProjectLabel ? projectName(task.projectId) : undefined}
          onRequestDelete={onRequestDelete}
          onRequestIconChange={onRequestIconChange}
        />
      ))}
    </div>
  )
}

function TaskRow({
  task,
  today,
  isTaskCompleted,
  toggleCompletion,
  updateTask,
  pName,
  onRequestDelete,
  onRequestIconChange,
}: {
  task: FixedTask
  today: string
  isTaskCompleted: (taskId: string, date: string) => boolean
  toggleCompletion: (taskId: string, date: string) => void
  updateTask: (taskId: string, patch: Partial<Pick<FixedTask, "name" | "icon">>) => void
  pName: string | undefined
  onRequestDelete: (task: FixedTask) => void
  onRequestIconChange: (task: FixedTask) => void
}) {
  const t = useT()
  const lang = useLang()
  const hasIcon = task.icon !== NONE_ICON
  const Icon = hasIcon ? getTaskIcon(task.icon) : null
  const done = isTaskCompleted(task.id, today)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(task.name)

  const longPress = useLongPress(() => {
    if (!editing) onRequestDelete(task)
  })

  function commitRename() {
    const v = draft.trim()
    if (v && v !== task.name) updateTask(task.id, { name: v })
    else setDraft(task.name)
    setEditing(false)
  }

  return (
    <div
      className="flex select-none items-center gap-3 border-b border-border py-3 last:border-none"
      onContextMenu={(e) => e.preventDefault()}
      {...longPress}
    >
      {Icon && (
        <button
          type="button"
          onClick={() => onRequestIconChange(task)}
          aria-label={t("today_change_icon_aria")}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[9px] bg-secondary"
        >
          <Icon size={16} strokeWidth={1.7} className="text-ink-soft" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename()
              if (e.key === "Escape") {
                setDraft(task.name)
                setEditing(false)
              }
            }}
            className="w-full rounded-md border border-input bg-card px-1.5 py-0.5 text-[13.5px] font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40"
          />
        ) : (
          <button type="button" onClick={() => setEditing(true)} className="block max-w-full text-left">
            <span className={`truncate text-[13.5px] font-semibold ${done ? "text-ink-faint line-through" : ""}`}>
              {task.name}
            </span>
          </button>
        )}
        <div className="mt-0.5 text-[10px] font-medium text-ink-faint">
          {repeatLabel(task.repeat, t, lang)}
          {pName ? ` · ${pName}` : ""}
        </div>
      </div>
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
    </div>
  )
}

function repeatLabel(repeat: RepeatRule, t: ReturnType<typeof useT>, lang: ReturnType<typeof useLang>): string {
  if (repeat.kind === "daily") return t("common_daily")
  if (repeat.kind === "once") return t("common_once")
  const names = WEEKDAY[lang]
  return repeat.days.map((d) => names[d]).join("·") || t("common_weekdays")
}

// 길게 누르면 onLongPress를 실행한다. 손가락이 8px 넘게 움직이면(스크롤 의도로 보고) 취소한다.
function useLongPress(onLongPress: () => void, ms = 500) {
  const timer = useRef<number | null>(null)
  const start = useRef<{ x: number; y: number } | null>(null)

  function clear() {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
    start.current = null
  }

  function down(e: ReactPointerEvent) {
    start.current = { x: e.clientX, y: e.clientY }
    timer.current = window.setTimeout(onLongPress, ms)
  }

  function move(e: ReactPointerEvent) {
    if (!start.current) return
    const dx = e.clientX - start.current.x
    const dy = e.clientY - start.current.y
    if (Math.hypot(dx, dy) > 8) clear()
  }

  return {
    onPointerDown: down,
    onPointerMove: move,
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
  }
}

// 두 섹션(고정/오늘만)의 순서를 손잡이 드래그로 맞바꾼다. 아이템이 2개뿐이라 "맞바꾸기"로 충분하다.
// 드래그 중인 섹션만 손가락을 따라 transform으로 움직이고, 상대 섹션은 절반을 넘어오면
// 자기 자리로 transform해 비켜준다 — 놓는 순간 실제 순서를 커밋하면서 transform을 지운다.
function useSectionReorder(order: TodaySection[], onCommit: (order: TodaySection[]) => void) {
  const elRefs = useRef<Partial<Record<TodaySection, HTMLDivElement | null>>>({})
  const [dragKey, setDragKey] = useState<TodaySection | null>(null)
  const [dragY, setDragY] = useState(0)
  const [crossed, setCrossed] = useState(false)
  const startY = useRef(0)
  const selfHeight = useRef(0)
  const otherHeight = useRef(0)

  function otherOf(key: TodaySection): TodaySection {
    return key === "recurring" ? "adhoc" : "recurring"
  }

  function handlePointerDown(key: TodaySection, e: ReactPointerEvent<HTMLButtonElement>) {
    const selfEl = elRefs.current[key]
    const otherEl = elRefs.current[otherOf(key)]
    selfHeight.current = selfEl?.getBoundingClientRect().height ?? 0
    otherHeight.current = otherEl?.getBoundingClientRect().height ?? 0
    startY.current = e.clientY
    setDragKey(key)
    setDragY(0)
    setCrossed(false)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 일부 브라우저/상황에서는 활성 포인터가 없다고 거부할 수 있다 — 드래그 자체는 계속 동작한다.
    }
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragKey) return
    const delta = e.clientY - startY.current
    setDragY(delta)
    const selfIsFirst = order[0] === dragKey
    const threshold = otherHeight.current / 2
    setCrossed(selfIsFirst ? delta > threshold : delta < -threshold)
  }

  function handlePointerUp() {
    if (!dragKey) return
    if (crossed) onCommit([...order].reverse() as TodaySection[])
    setDragKey(null)
    setDragY(0)
    setCrossed(false)
  }

  function styleFor(key: TodaySection): CSSProperties {
    if (key === dragKey) {
      return { transform: `translateY(${dragY}px)`, position: "relative", zIndex: 10 }
    }
    if (dragKey && otherOf(dragKey) === key) {
      const selfIsFirst = order[0] === dragKey
      const shift = selfIsFirst ? -(selfHeight.current + SECTION_GAP) : selfHeight.current + SECTION_GAP
      return { transform: crossed ? `translateY(${shift}px)` : "none", transition: "transform 120ms ease" }
    }
    return {}
  }

  return { elRefs, handlePointerDown, handlePointerMove, handlePointerUp, styleFor }
}
