import { CalendarCheck2 } from "lucide-react"

export function Splash() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-background">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
        <CalendarCheck2 size={28} strokeWidth={2} className="text-primary" />
      </div>
      <div className="mt-4 text-[13px] font-bold tracking-[0.14em] text-ink-soft">
        TASK CHECK
      </div>
      <div
        className="respoflov-mark absolute inset-x-0 text-center"
        style={{ bottom: "max(34px, calc(env(safe-area-inset-bottom) + 22px))" }}
      >
        RESPOFLOV
      </div>
    </div>
  )
}
