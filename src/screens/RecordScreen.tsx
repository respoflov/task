import { useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronDown, Check, Plus, X } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { buildMonthGrid, type CalendarCell } from "@/lib/calendar"
import { computeDayStats, scheduledOnceCount, tasksForDate } from "@/lib/record"
import {
  isFuture,
  isPastOrToday,
  todayStr,
  formatMonthLabel,
  formatDateShort,
  weekdayHeaderFor,
  type WeekStart,
} from "@/lib/date"
import { appliesToDate } from "@/lib/tasks"
import { useT, useLang, useSubtitle } from "@/lib/i18n"
import { RatioRingCell } from "@/components/RatioRingCell"
import { YearMonthPicker } from "@/components/YearMonthPicker"
import { NONE_ICON } from "@/lib/icons"
import type { AppData } from "@/lib/types"

type Mode = "all" | "project" | "once" | "item"
const MODES: Mode[] = ["all", "project", "once", "item"]
const SWIPE_TRANSITION = "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)"

// 세그먼트(전체/프로젝트별/오늘만/고정 항목별)를 좌우로 스와이프해서 넘기는 훅.
// 가로 이동이 세로 이동보다 뚜렷할 때만(6px 이상) 가로 드래그로 확정하고, 그 전까지는
// 페이지 세로 스크롤을 그대로 둔다. 실제 드래그가 있었으면(10px 이상) 바로 다음 탭 이벤트를
// 한 번 삼켜서, 스와이프 끝에 손가락 아래 있던 버튼이 실수로 눌리지 않게 한다.
function useSwipeCarousel(index: number, onChangeIndex: (i: number) => void, count: number) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const startX = useRef(0)
  const startY = useRef(0)
  const widthRef = useRef(1)
  const axisRef = useRef<"none" | "x" | "y">("none")
  const suppressClickRef = useRef(false)
  // pointerup 판정은 이 ref로 한다 — dragX(state)는 리액트 렌더 배치를 거치므로,
  // pointermove 여러 번과 pointerup이 같은 틱 안에서 연달아 오면 아직 반영 안 된 값을 읽을 수 있다.
  const dragXRef = useRef(0)

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    startY.current = e.clientY
    axisRef.current = "none"
    widthRef.current = containerRef.current?.clientWidth || 1
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = e.clientX - startX.current
    const dy = e.clientY - startY.current
    if (axisRef.current === "none") {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return
      axisRef.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y"
      if (axisRef.current === "x") {
        setDragging(true)
        try {
          ;(e.target as Element).setPointerCapture(e.pointerId)
        } catch {
          // 일부 환경에서 포인터 캡처가 무의미한 상태일 때 발생 — 무해함
        }
      }
    }
    if (axisRef.current !== "x") return
    e.preventDefault()
    let next = dx
    if (index === 0 && next > 0) next *= 0.35
    if (index === count - 1 && next < 0) next *= 0.35
    dragXRef.current = next
    setDragX(next)
  }

  function onPointerUp() {
    if (axisRef.current === "x") {
      const width = widthRef.current || 1
      const threshold = width * 0.22
      const finalDragX = dragXRef.current
      if (Math.abs(finalDragX) > 10) suppressClickRef.current = true
      if (finalDragX <= -threshold && index < count - 1) onChangeIndex(index + 1)
      else if (finalDragX >= threshold && index > 0) onChangeIndex(index - 1)
    }
    setDragging(false)
    setDragX(0)
    dragXRef.current = 0
    axisRef.current = "none"
  }

  function onClickCapture(e: React.MouseEvent) {
    if (suppressClickRef.current) {
      e.preventDefault()
      e.stopPropagation()
      suppressClickRef.current = false
    }
  }

  return {
    containerRef,
    dragX,
    dragging,
    progress: index - dragX / (widthRef.current || 1),
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onClickCapture,
  }
}

export function RecordScreen() {
  const { data, isTaskCompleted, toggleCompletion, addTask, removeTask } = useAppData()
  const t = useT()
  const lang = useLang()
  const subtitle = useSubtitle("nav_record")
  const today = todayStr()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month0, setMonth0] = useState(now.getMonth())
  const [modeIndex, setModeIndex] = useState(0)
  const mode = MODES[modeIndex]
  const [projectId, setProjectId] = useState<string | null>(data.projects[0]?.id ?? null)
  const [taskId, setTaskId] = useState<string | null>(data.tasks[0]?.id ?? null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const weekStart = data.settings.weekStart
  const cells = useMemo(() => buildMonthGrid(year, month0, weekStart), [year, month0, weekStart])

  const filterFn = useMemo(() => {
    if (mode === "project" && projectId) return (task: (typeof data.tasks)[number]) => task.projectId === projectId
    if (mode === "once") return (task: (typeof data.tasks)[number]) => task.repeat.kind === "once"
    return undefined
  }, [mode, projectId])

  const selectedTask = mode === "item" ? data.tasks.find((task) => task.id === taskId) : undefined

  function goMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1)
    setYear(d.getFullYear())
    setMonth0(d.getMonth())
    setSelectedDate(null)
  }

  function goToMonth(y: number, m0: number) {
    setYear(y)
    setMonth0(m0)
    setSelectedDate(null)
  }

  function changeMode(index: number) {
    setModeIndex(index)
    setSelectedDate(null)
  }

  const swipe = useSwipeCarousel(modeIndex, changeMode, MODES.length)

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
              : mode === "once"
                ? t("record_once_title")
                : t("record_all_title")}
        </div>
      </div>

      <div className="relative mb-3 flex rounded-[10px] bg-secondary p-[3px]">
        <div
          className="absolute inset-y-[3px] rounded-lg bg-card shadow-sm"
          style={{
            width: `calc((100% - 6px) / ${MODES.length})`,
            transform: `translateX(${swipe.progress * 100}%)`,
            transition: swipe.dragging ? "none" : SWIPE_TRANSITION,
          }}
        />
        {(
          [
            { key: "all" as const, label: t("record_mode_all") },
            { key: "project" as const, label: t("record_mode_project") },
            { key: "once" as const, label: t("record_mode_once") },
            { key: "item" as const, label: t("record_mode_item") },
          ]
        ).map((opt, i) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => changeMode(i)}
            className={`relative z-10 flex-1 rounded-lg py-1.5 text-[11.5px] font-bold ${
              mode === opt.key ? "text-primary" : "text-ink-soft"
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

      <div
        ref={swipe.containerRef}
        className="overflow-hidden"
        onPointerDown={swipe.onPointerDown}
        onPointerMove={swipe.onPointerMove}
        onPointerUp={swipe.onPointerUp}
        onPointerCancel={swipe.onPointerUp}
        onClickCapture={swipe.onClickCapture}
      >
        <div
          className="flex"
          style={{
            transform: `translateX(calc(${-modeIndex * 100}% + ${swipe.dragX}px))`,
            transition: swipe.dragging ? "none" : SWIPE_TRANSITION,
          }}
        >
          {MODES.map((panelMode) => (
            <div key={panelMode} className="w-full shrink-0">
              <CalendarCard
                panelMode={panelMode}
                year={year}
                month0={month0}
                cells={cells}
                weekStart={weekStart}
                lang={lang}
                today={today}
                data={data}
                isTaskCompleted={isTaskCompleted}
                projectId={projectId}
                taskId={taskId}
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate((cur) => (cur === d ? null : d))}
                onPrevMonth={() => goMonth(-1)}
                onNextMonth={() => goMonth(1)}
                onOpenPicker={() => setPickerOpen(true)}
              />
            </div>
          ))}
        </div>
      </div>

      {selectedDate && mode === "item" && selectedTask && !selectedIsFuture && (
        <DateDetail
          key={selectedDate}
          date={selectedDate}
          tasks={selectedTask.createdAt > selectedDate ? [] : [selectedTask]}
          isTaskCompleted={isTaskCompleted}
          toggleCompletion={toggleCompletion}
        />
      )}

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

      <YearMonthPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        year={year}
        month0={month0}
        onConfirm={goToMonth}
      />
    </div>
  )
}

// 세그먼트 4개(전체/프로젝트별/오늘만/고정 항목별)가 스와이프 스트립 안에서 나란히 마운트되는
// 달력 카드. 4개 모두 같은 cells(월 그리드)를 쓰므로 스와이프 도중에도 높이가 흔들리지 않는다 —
// 칸의 개수·크기는 동일하고 각 칸 안의 링(RatioRingCell) 내용만 panelMode에 따라 달라진다.
function CalendarCard({
  panelMode,
  year,
  month0,
  cells,
  weekStart,
  lang,
  today,
  data,
  isTaskCompleted,
  projectId,
  taskId,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onOpenPicker,
}: {
  panelMode: Mode
  year: number
  month0: number
  cells: CalendarCell[]
  weekStart: WeekStart
  lang: ReturnType<typeof useLang>
  today: string
  data: AppData
  isTaskCompleted: (taskId: string, date: string) => boolean
  projectId: string | null
  taskId: string | null
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onOpenPicker: () => void
}) {
  const filterFn = useMemo(() => {
    if (panelMode === "project" && projectId)
      return (task: (typeof data.tasks)[number]) => task.projectId === projectId
    if (panelMode === "once") return (task: (typeof data.tasks)[number]) => task.repeat.kind === "once"
    return undefined
  }, [panelMode, projectId])

  const selectedTask = panelMode === "item" ? data.tasks.find((task) => task.id === taskId) : undefined

  return (
    <div className="mb-3 rounded-[14px] border border-border bg-card px-2.5 py-3.5">
      <div className="mb-2.5 flex items-center justify-between px-0.5">
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex items-center gap-0.5 text-[11px] font-bold text-ink-soft"
        >
          {formatMonthLabel(year, month0, lang)}
          <ChevronDown size={12} strokeWidth={2.4} />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex h-6 w-6 items-center justify-center text-ink-faint"
          >
            <ChevronLeft size={15} />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex h-6 w-6 items-center justify-center text-ink-faint"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div className="mb-1.5 grid grid-cols-7">
        {weekdayHeaderFor(lang, weekStart).map((w, i) => {
          const satIndex = weekStart === "sun" ? 6 : 5
          const sunIndex = weekStart === "sun" ? 0 : 6
          return (
            <span
              key={w}
              className="text-center text-[9px] font-bold"
              style={{ color: i === satIndex ? "var(--sat)" : i === sunIndex ? "var(--sun)" : "var(--ink-faint)" }}
            >
              {w}
            </span>
          )
        })}
      </div>

      <div className="grid grid-cols-7 gap-y-1.5">
        {cells.map((cell) => {
          const isToday = cell.date === today
          let node: React.ReactNode

          if (!cell.inMonth) {
            node = <RatioRingCell variant={{ kind: "blank" }} />
          } else if (panelMode === "item" && selectedTask) {
            if (isFuture(cell.date)) {
              // 요일 반복·매일 반복 항목도 "오늘만" 항목처럼 앞으로 적용될 날짜를 미리 보여준다.
              const applies = appliesToDate(selectedTask, cell.date)
              node = (
                <RatioRingCell
                  variant={applies ? { kind: "future-count", count: 1 } : { kind: "empty" }}
                  selected={cell.date === selectedDate}
                />
              )
            } else {
              node = selectedTask.createdAt > cell.date ? (
                <RatioRingCell variant={{ kind: "empty" }} />
              ) : (
                <RatioRingCell
                  variant={{ kind: "binary", done: isTaskCompleted(selectedTask.id, cell.date) }}
                  selected={cell.date === selectedDate}
                />
              )
            }
          } else if (isFuture(cell.date)) {
            const count = panelMode === "all" || panelMode === "once" ? scheduledOnceCount(data.tasks, cell.date) : 0
            node = (
              <RatioRingCell
                variant={count > 0 ? { kind: "future-count", count } : { kind: "empty" }}
                selected={cell.date === selectedDate}
              />
            )
          } else {
            const stats = computeDayStats(data.tasks, data.completions, cell.date, filterFn)
            node =
              stats.total === 0 ? (
                <RatioRingCell variant={{ kind: "empty" }} />
              ) : (
                <RatioRingCell variant={{ kind: "ratio", pct: stats.pct }} selected={cell.date === selectedDate} />
              )
          }

          return (
            <button
              key={cell.date}
              type="button"
              disabled={!cell.inMonth}
              onClick={() => onSelectDate(cell.date)}
              className="flex flex-col items-center gap-1"
            >
              {node}
              {cell.inMonth && (
                <span
                  className="text-[7.5px] font-semibold"
                  style={{
                    color: isToday ? "var(--primary)" : "var(--ink-faint)",
                    fontWeight: isToday ? 800 : 600,
                  }}
                >
                  {cell.day}
                </span>
              )}
            </button>
          )
        })}
      </div>
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
