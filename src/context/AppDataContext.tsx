import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { AppData, FixedTask, Milestone, MilestoneStatus, Project, RepeatRule } from "@/lib/types"
import { loadData, saveData, newId, emptyData, isValidAppData } from "@/lib/storage"
import { todayStr } from "@/lib/date"

interface AppDataContextValue {
  data: AppData
  addTask: (input: { name: string; icon: string; repeat: RepeatRule; projectId: string | null }) => void
  removeTask: (taskId: string) => void
  toggleCompletion: (taskId: string, date: string) => void
  isTaskCompleted: (taskId: string, date: string) => boolean
  addMindsetQuote: (text: string) => void
  removeMindsetQuote: (id: string) => void
  updateSettings: (patch: Partial<AppData["settings"]>) => void
  addProject: (input: { name: string; startDate: string }) => string
  addMilestone: (input: { projectId: string; title: string; targetLabel: string }) => void
  setMilestoneStatus: (milestoneId: string, status: MilestoneStatus) => void
  addMilestoneNote: (milestoneId: string, text: string) => void
  exportData: () => void
  importData: (file: File) => Promise<boolean>
  resetAllData: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const addTask: AppDataContextValue["addTask"] = ({ name, icon, repeat, projectId }) => {
    const task: FixedTask = {
      id: newId(),
      name,
      icon,
      repeat,
      projectId,
      createdAt: todayStr(),
      order: data.tasks.length,
    }
    setData((d) => ({ ...d, tasks: [...d.tasks, task] }))
  }

  const removeTask: AppDataContextValue["removeTask"] = (taskId) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.filter((t) => t.id !== taskId),
      completions: d.completions.filter((c) => c.taskId !== taskId),
    }))
  }

  const isTaskCompleted: AppDataContextValue["isTaskCompleted"] = (taskId, date) =>
    data.completions.some((c) => c.taskId === taskId && c.date === date)

  const toggleCompletion: AppDataContextValue["toggleCompletion"] = (taskId, date) => {
    setData((d) => {
      const exists = d.completions.some((c) => c.taskId === taskId && c.date === date)
      return {
        ...d,
        completions: exists
          ? d.completions.filter((c) => !(c.taskId === taskId && c.date === date))
          : [...d.completions, { taskId, date }],
      }
    })
  }

  const addMindsetQuote: AppDataContextValue["addMindsetQuote"] = (text) => {
    setData((d) => ({ ...d, mindsetQuotes: [...d.mindsetQuotes, { id: newId(), text }] }))
  }

  const removeMindsetQuote: AppDataContextValue["removeMindsetQuote"] = (id) => {
    setData((d) => ({ ...d, mindsetQuotes: d.mindsetQuotes.filter((q) => q.id !== id) }))
  }

  const updateSettings: AppDataContextValue["updateSettings"] = (patch) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }

  const addProject: AppDataContextValue["addProject"] = ({ name, startDate }) => {
    const project: Project = { id: newId(), name, startDate, order: data.projects.length }
    setData((d) => ({ ...d, projects: [...d.projects, project] }))
    return project.id
  }

  const addMilestone: AppDataContextValue["addMilestone"] = ({ projectId, title, targetLabel }) => {
    setData((d) => {
      const siblings = d.milestones.filter((m) => m.projectId === projectId)
      const hasActive = siblings.some((m) => m.status === "active")
      const milestone: Milestone = {
        id: newId(),
        projectId,
        title,
        targetLabel,
        status: hasActive || siblings.length > 0 ? "todo" : "active",
        completedDate: null,
        order: siblings.length,
      }
      return { ...d, milestones: [...d.milestones, milestone] }
    })
  }

  const setMilestoneStatus: AppDataContextValue["setMilestoneStatus"] = (milestoneId, status) => {
    setData((d) => {
      const target = d.milestones.find((m) => m.id === milestoneId)
      let milestones = d.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, status, completedDate: status === "done" ? todayStr() : m.completedDate }
          : m
      )
      // 완료로 넘어가면, 같은 프로젝트에서 다음 순서의 "예정" 단계를 자동으로 "진행 중"으로 승격한다.
      if (status === "done" && target) {
        const siblings = milestones
          .filter((m) => m.projectId === target.projectId)
          .sort((a, b) => a.order - b.order)
        const next = siblings.find((m) => m.order > target.order && m.status === "todo")
        if (next) {
          milestones = milestones.map((m) => (m.id === next.id ? { ...m, status: "active" } : m))
        }
      }
      return { ...d, milestones }
    })
  }

  const addMilestoneNote: AppDataContextValue["addMilestoneNote"] = (milestoneId, text) => {
    setData((d) => ({
      ...d,
      milestoneNotes: [...d.milestoneNotes, { id: newId(), milestoneId, date: todayStr(), text }],
    }))
  }

  const exportData: AppDataContextValue["exportData"] = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `daily-task-check-${todayStr()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData: AppDataContextValue["importData"] = async (file) => {
    let parsed: unknown
    try {
      const text = await file.text()
      parsed = JSON.parse(text)
    } catch {
      return false
    }
    if (!isValidAppData(parsed)) return false
    setData((d) => ({ ...d, ...parsed }))
    return true
  }

  const resetAllData: AppDataContextValue["resetAllData"] = () => {
    setData(emptyData())
  }

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      addTask,
      removeTask,
      toggleCompletion,
      isTaskCompleted,
      addMindsetQuote,
      removeMindsetQuote,
      updateSettings,
      addProject,
      addMilestone,
      setMilestoneStatus,
      addMilestoneNote,
      exportData,
      importData,
      resetAllData,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider")
  return ctx
}
