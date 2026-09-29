// 화면 아래 5칸 탭 막대
import { CheckCircle2, LayoutGrid, Leaf, Flag, Settings2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useT, type TKey } from "@/lib/i18n"

// 탭 이름 (오늘·기록·마음가짐·프로젝트·설정)
export type TabKey = "today" | "record" | "mindset" | "project" | "settings"

const TABS: { key: TabKey; labelKey: TKey; icon: LucideIcon }[] = [
  { key: "today", labelKey: "nav_today", icon: CheckCircle2 },
  { key: "project", labelKey: "nav_project", icon: Flag },
  { key: "record", labelKey: "nav_record", icon: LayoutGrid },
  { key: "mindset", labelKey: "nav_mindset", icon: Leaf },
  { key: "settings", labelKey: "nav_settings", icon: Settings2 },
]

// 현재 탭을 강조하고 누르면 onChange로 탭을 바꾼다
export function BottomNav({ active, onChange }: { active: TabKey; onChange: (t: TabKey) => void }) {
  const t = useT()
  return (
    <nav className="flex shrink-0 border-t border-border bg-background px-1 pb-[max(16px,env(safe-area-inset-bottom))] pt-2">
      {TABS.map((tab) => {
        const isActive = tab.key === active
        const Icon = tab.icon
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-[10px] font-semibold ${
              isActive ? "text-primary" : "text-ink-faint"
            }`}
          >
            <Icon size={20} strokeWidth={1.8} />
            <span>{t(tab.labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
