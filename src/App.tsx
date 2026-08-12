import { useEffect, useState } from "react"
import { AppDataProvider, useAppData } from "@/context/AppDataContext"
import { useThemeEffect } from "@/lib/useThemeEffect"
import { todayStr } from "@/lib/date"
import { Splash } from "@/components/Splash"
import { MindsetPopup } from "@/components/MindsetPopup"
import { SyncIntroPopup } from "@/components/SyncIntroPopup"
import { BottomNav, type TabKey } from "@/components/BottomNav"
import { TodayScreen } from "@/screens/TodayScreen"
import { RecordScreen } from "@/screens/RecordScreen"
import { MindsetScreen } from "@/screens/MindsetScreen"
import { ProjectScreen } from "@/screens/ProjectScreen"
import { SettingsScreen } from "@/screens/SettingsScreen"

type Phase = "splash" | "sync-intro" | "mindset-popup" | "app"

function Shell() {
  const { data, updateSettings } = useAppData()
  useThemeEffect(data.settings.theme)

  const [phase, setPhase] = useState<Phase>("splash")
  const [tab, setTab] = useState<TabKey>("today")
  const [settingsKey, setSettingsKey] = useState(0)
  const [mindsetClosing, setMindsetClosing] = useState(false)

  // 설정 탭을 누를 때마다(이미 그 탭에 있어도) SettingsScreen을 새로 마운트해
  // 하위 화면(동기화·문구 편집 등)에 들어가 있던 상태를 최상위 목록으로 되돌린다.
  function handleTabChange(next: TabKey) {
    if (next === "settings") setSettingsKey((k) => k + 1)
    setTab(next)
  }

  function goToMindsetOrApp() {
    const shownToday = data.settings.lastMindsetShownDate === todayStr()
    setPhase(shownToday || data.mindsetQuotes.length === 0 ? "app" : "mindset-popup")
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (!data.settings.syncIntroSeen) {
        setPhase("sync-intro")
        return
      }
      goToMindsetOrApp()
    }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (phase === "splash") return <Splash />

  if (phase === "sync-intro") {
    return (
      <SyncIntroPopup
        onLater={() => {
          updateSettings({ syncIntroSeen: true })
          goToMindsetOrApp()
        }}
        onGoSettings={() => {
          updateSettings({ syncIntroSeen: true })
          setTab("settings")
          setPhase("app")
        }}
      />
    )
  }

  if (phase === "mindset-popup") {
    // 닫을 때 바로 오늘 탭으로 끊지 않고, 스플래시 위에서 서서히 사라지게 한다
    // (진입할 때와 대칭되는 마무리 — 스플래시로 되돌아갔다가 앱으로 넘어가는 느낌).
    return (
      <div className="relative h-full w-full">
        <Splash />
        <div className={`absolute inset-0 transition-opacity duration-500 ${mindsetClosing ? "opacity-0" : "opacity-100"}`}>
          <MindsetPopup
            onDismiss={() => {
              setMindsetClosing(true)
              setTimeout(() => {
                updateSettings({
                  lastMindsetShownDate: todayStr(),
                  lastSequentialIndex:
                    data.settings.mindsetOrder === "sequential"
                      ? (data.settings.lastSequentialIndex + 1) % Math.max(data.mindsetQuotes.length, 1)
                      : data.settings.lastSequentialIndex,
                })
                setPhase("app")
                setMindsetClosing(false)
              }, 500)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {tab === "today" && <TodayScreen />}
        {tab === "record" && <RecordScreen />}
        {tab === "mindset" && <MindsetScreen onNavigate={setTab} />}
        {tab === "project" && <ProjectScreen />}
        {tab === "settings" && <SettingsScreen key={settingsKey} />}
      </div>
      <BottomNav active={tab} onChange={handleTabChange} />
    </div>
  )
}

function App() {
  return (
    <AppDataProvider>
      <div className="mx-auto h-svh max-w-[480px] bg-background text-foreground">
        <Shell />
      </div>
    </AppDataProvider>
  )
}

export default App
