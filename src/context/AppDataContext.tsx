import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import type { AppData, FixedTask, Milestone, MilestoneStatus, Project, RepeatRule } from "@/lib/types"
import { loadData, saveData, newId, emptyData, isValidAppData, normalizeData } from "@/lib/storage"
import { todayStr } from "@/lib/date"
import { generateSyncCode, pushToCloud, pullFromCloud, toPayload, SyncError, type SyncPayload } from "@/lib/sync"

export type SyncStatus = "idle" | "syncing" | "error"

interface AppDataContextValue {
  data: AppData
  addTask: (input: { name: string; icon: string; repeat: RepeatRule; projectId: string | null }) => void
  updateTask: (taskId: string, patch: Partial<Pick<FixedTask, "name" | "icon">>) => void
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
  syncStatus: SyncStatus
  syncError: string | null
  createSyncCode: () => Promise<string>
  pairWithSyncCode: (code: string) => Promise<boolean>
  syncNow: () => Promise<void>
  disableSync: () => void
}

const AppDataContext = createContext<AppDataContextValue | null>(null)

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle")
  const [syncError, setSyncError] = useState<string | null>(null)
  const lastPushedRef = useRef<string | null>(null)
  const pushTimerRef = useRef<number | null>(null)
  const pulledOnMountRef = useRef(false)

  useEffect(() => {
    saveData(data)
  }, [data])

  // 이 기기의 값(syncCode 등)을 유지한 채, 다른 기기에서 받아온 내용으로 나머지를 덮어쓴다.
  function applyRemote(payload: SyncPayload, updatedAt: string) {
    setData((d) => ({
      ...payload,
      settings: { ...d.settings, ...payload.settings, syncUpdatedAt: updatedAt },
    }))
    lastPushedRef.current = JSON.stringify(payload)
  }

  // 앱을 열었을 때 이미 동기화 코드가 연결되어 있으면 한 번 당겨와서, 다른 기기에서
  // 바뀐 내용을 놓치지 않게 한다. 실패해도 조용히 넘어간다(오프라인일 수 있으므로).
  useEffect(() => {
    if (pulledOnMountRef.current) return
    const code = data.settings.syncCode
    if (!code) return
    pulledOnMountRef.current = true
    setSyncStatus("syncing")
    pullFromCloud(code)
      .then((remote) => {
        if (remote && (!data.settings.syncUpdatedAt || remote.updatedAt > data.settings.syncUpdatedAt)) {
          applyRemote(remote.payload, remote.updatedAt)
        }
        setSyncStatus("idle")
      })
      .catch((e) => {
        setSyncStatus("error")
        setSyncError(e instanceof SyncError ? e.message : String(e))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 로컬 데이터가 바뀌면(그리고 동기화 코드가 연결돼 있으면) 2초 뒤 조용히 클라우드로 올린다.
  // syncUpdatedAt만 바뀐 경우(방금 우리가 올린 결과 반영)는 내용이 같으므로 다시 올리지 않는다.
  useEffect(() => {
    const code = data.settings.syncCode
    if (!code) return
    const snapshot = JSON.stringify(toPayload(data))
    if (snapshot === lastPushedRef.current) return
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current)
    pushTimerRef.current = window.setTimeout(() => {
      pushToCloud(code, data)
        .then((updatedAt) => {
          lastPushedRef.current = snapshot
          setData((d) => ({ ...d, settings: { ...d.settings, syncUpdatedAt: updatedAt } }))
        })
        .catch(() => {
          // 자동 백그라운드 업로드 실패는 조용히 넘어간다 — 다음 변경이나 수동 동기화 때 다시 시도된다.
        })
    }, 2000)
    return () => {
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const addTask: AppDataContextValue["addTask"] = ({ name, icon, repeat, projectId }) => {
    const task: FixedTask = {
      id: newId(),
      name,
      icon,
      repeat,
      projectId,
      createdAt: todayStr(),
      deletedAt: null,
      order: data.tasks.length,
    }
    setData((d) => ({ ...d, tasks: [...d.tasks, task] }))
  }

  const updateTask: AppDataContextValue["updateTask"] = (taskId, patch) => {
    setData((d) => ({ ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) }))
  }

  // 완료 기록이 하나라도 있으면 deletedAt만 오늘 날짜로 표시해 소프트 삭제한다 — 오늘부터
  // 목록에서 사라지지만 그 이전 완료 기록은 그대로 남아 기록 탭에서 계속 보인다.
  // 완료 기록이 전혀 없는 항목(예: 아직 오지 않은 미래 예약)은 남길 기록이 없으므로 그냥 지운다.
  const removeTask: AppDataContextValue["removeTask"] = (taskId) => {
    setData((d) => {
      const hasHistory = d.completions.some((c) => c.taskId === taskId)
      if (!hasHistory) {
        return { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }
      }
      return { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, deletedAt: todayStr() } : t)) }
    })
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
    setData((d) => normalizeData({ ...d, ...parsed }))
    return true
  }

  const resetAllData: AppDataContextValue["resetAllData"] = () => {
    setData(emptyData())
  }

  // 새 동기화 코드를 만들고, 지금 이 기기의 데이터를 그 코드의 첫 데이터로 올린다.
  const createSyncCode: AppDataContextValue["createSyncCode"] = async () => {
    const code = generateSyncCode()
    setSyncStatus("syncing")
    setSyncError(null)
    try {
      const updatedAt = await pushToCloud(code, data)
      lastPushedRef.current = JSON.stringify(toPayload(data))
      setData((d) => ({ ...d, settings: { ...d.settings, syncCode: code, syncUpdatedAt: updatedAt } }))
      setSyncStatus("idle")
      return code
    } catch (e) {
      setSyncStatus("error")
      setSyncError(e instanceof SyncError ? e.message : String(e))
      throw e
    }
  }

  // 다른 기기에서 만든 코드를 입력해 페어링한다. 이미 그 코드로 올라간 데이터가 있으면
  // 그걸로 이 기기 데이터를 덮어쓰고, 없으면(처음 쓰는 코드면) 이 기기 데이터를 올려서 시작한다.
  const pairWithSyncCode: AppDataContextValue["pairWithSyncCode"] = async (code) => {
    setSyncStatus("syncing")
    setSyncError(null)
    try {
      const remote = await pullFromCloud(code)
      if (remote) {
        applyRemote(remote.payload, remote.updatedAt)
        setData((d) => ({ ...d, settings: { ...d.settings, syncCode: code } }))
      } else {
        const updatedAt = await pushToCloud(code, data)
        lastPushedRef.current = JSON.stringify(toPayload(data))
        setData((d) => ({ ...d, settings: { ...d.settings, syncCode: code, syncUpdatedAt: updatedAt } }))
      }
      setSyncStatus("idle")
      return true
    } catch (e) {
      setSyncStatus("error")
      setSyncError(e instanceof SyncError ? e.message : String(e))
      return false
    }
  }

  // 수동 "지금 동기화" — 클라우드가 더 최신이면 받아오고, 아니면 지금 상태를 올린다.
  const syncNow: AppDataContextValue["syncNow"] = async () => {
    const code = data.settings.syncCode
    if (!code) return
    setSyncStatus("syncing")
    setSyncError(null)
    try {
      const remote = await pullFromCloud(code)
      if (remote && (!data.settings.syncUpdatedAt || remote.updatedAt > data.settings.syncUpdatedAt)) {
        applyRemote(remote.payload, remote.updatedAt)
      } else {
        const updatedAt = await pushToCloud(code, data)
        lastPushedRef.current = JSON.stringify(toPayload(data))
        setData((d) => ({ ...d, settings: { ...d.settings, syncUpdatedAt: updatedAt } }))
      }
      setSyncStatus("idle")
    } catch (e) {
      setSyncStatus("error")
      setSyncError(e instanceof SyncError ? e.message : String(e))
    }
  }

  // 이 기기의 연결만 끊는다 — 코드로 올라간 클라우드 데이터 자체는 지우지 않는다
  // (다른 기기가 같은 코드로 계속 동기화할 수 있어야 하므로).
  const disableSync: AppDataContextValue["disableSync"] = () => {
    setData((d) => ({ ...d, settings: { ...d.settings, syncCode: null, syncUpdatedAt: null } }))
  }

  const value = useMemo<AppDataContextValue>(
    () => ({
      data,
      addTask,
      updateTask,
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
      syncStatus,
      syncError,
      createSyncCode,
      pairWithSyncCode,
      syncNow,
      disableSync,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, syncStatus, syncError]
  )

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext)
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider")
  return ctx
}
