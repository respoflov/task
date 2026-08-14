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

// 진입 흐름(스플래시→팝업→랜딩)의 모든 전환은 이 크로스페이드 하나로 통일한다:
// 현재 화면 페이드아웃 → 배경색으로 잠깐 정지 → 다음 화면 페이드인.
// 스플래시(로고) 자체를 전환 중간에 다시 끼워 넣지 않는다 — GitHub_PWA/CLAUDE.md 참고.
const FADE_OUT_MS = 300
const GAP_MS = 150
const FADE_IN_MS = 300

function Shell() {
  const { data, updateSettings } = useAppData()
  useThemeEffect(data.settings.theme)

  const [phase, setPhase] = useState<Phase>("splash")
  const [visible, setVisible] = useState(true)
  // 설정에서 고른 랜딩 탭으로 시작한다 — 이후에는 평범한 탭 상태라 유저가 자유롭게 오갈 수 있다.
  const [tab, setTab] = useState<TabKey>(() => data.settings.landingTab)
  const [settingsKey, setSettingsKey] = useState(0)

  // 설정 탭을 누를 때마다(이미 그 탭에 있어도) SettingsScreen을 새로 마운트해
  // 하위 화면(동기화·문구 편집 등)에 들어가 있던 상태를 최상위 목록으로 되돌린다.
  function handleTabChange(next: TabKey) {
    if (next === "settings") setSettingsKey((k) => k + 1)
    setTab(next)
  }

  function goTo(next: Phase) {
    setVisible(false)
    setTimeout(() => {
      setPhase(next)
      setTimeout(() => setVisible(true), GAP_MS)
    }, FADE_OUT_MS)
  }

  function goToMindsetOrApp() {
    const shownToday = data.settings.lastMindsetShownDate === todayStr()
    goTo(shownToday || data.mindsetQuotes.length === 0 ? "app" : "mindset-popup")
  }

  useEffect(() => {
    const t = setTimeout(() => {
      if (!data.settings.syncIntroSeen) {
        goTo("sync-intro")
        return
      }
      goToMindsetOrApp()
    }, 900)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let content: React.ReactNode
  if (phase === "splash") {
    content = <Splash />
  } else if (phase === "sync-intro") {
    content = (
      <SyncIntroPopup
        onLater={() => {
          updateSettings({ syncIntroSeen: true })
          goToMindsetOrApp()
        }}
        onGoSettings={() => {
          updateSettings({ syncIntroSeen: true })
          setTab("settings")
          goTo("app")
        }}
      />
    )
  } else if (phase === "mindset-popup") {
    content = (
      <MindsetPopup
        onDismiss={() => {
          updateSettings({
            lastMindsetShownDate: todayStr(),
            lastSequentialIndex:
              data.settings.mindsetOrder === "sequential"
                ? (data.settings.lastSequentialIndex + 1) % Math.max(data.mindsetQuotes.length, 1)
                : data.settings.lastSequentialIndex,
          })
          goTo("app")
        }}
      />
    )
  } else {
    content = (
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1">
          {tab === "today" && <TodayScreen />}
          {tab === "record" && <RecordScreen />}
          {tab === "mindset" && <MindsetScreen />}
          {tab === "project" && <ProjectScreen />}
          {tab === "settings" && <SettingsScreen key={settingsKey} />}
        </div>
        <BottomNav active={tab} onChange={handleTabChange} />
      </div>
    )
  }

  return (
    <div
      className="h-full w-full bg-background transition-opacity ease-in-out"
      style={{ transitionDuration: `${visible ? FADE_IN_MS : FADE_OUT_MS}ms`, opacity: visible ? 1 : 0 }}
    >
      {content}
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
