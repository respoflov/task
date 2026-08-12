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
    return (
      <MindsetPopup
        onDismiss={() => {
          updateSettings({
            lastMindsetShownDate: todayStr(),
            lastSequentialIndex:
              data.settings.mindsetOrder === "sequential"
                ? (data.settings.lastSequentialIndex + 1) % Math.max(data.mindsetQuotes.length, 1)
                : data.settings.lastSequentialIndex,
          })
          setPhase("app")
        }}
      />
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="min-h-0 flex-1">
        {tab === "today" && <TodayScreen />}
        {tab === "record" && <RecordScreen />}
        {tab === "mindset" && <MindsetScreen onNavigate={setTab} />}
        {tab === "project" && <ProjectScreen />}
        {tab === "settings" && <SettingsScreen />}
      </div>
      <BottomNav active={tab} onChange={setTab} />
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
