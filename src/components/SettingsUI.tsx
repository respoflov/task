import { ChevronRight } from "lucide-react"
import type { ReactNode, ComponentType } from "react"

// 설정 탭과 그 하위 화면(동기화·라이선스·마음가짐 문구 편집 등)이 함께 쓰는
// 목록 레이아웃 조각들 — 화면마다 다시 만들지 않도록 여기 모아둔다.

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="mb-1.5 mt-4 px-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-faint first:mt-0.5">
      {children}
    </div>
  )
}

export function Group({ children }: { children: ReactNode }) {
  return <div className="overflow-hidden rounded-[13px] border border-border bg-card">{children}</div>
}

export function Row({
  icon: Icon,
  label,
  right,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  right: ReactNode
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-none">
      <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon size={14} strokeWidth={1.8} className="text-ink-soft" />
      </div>
      <div className="flex-1 text-[12.5px] font-semibold">{label}</div>
      {right}
    </div>
  )
}

export function ClickRow({
  icon: Icon,
  label,
  preview,
  danger,
  expanded,
  onClick,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  preview?: string
  danger?: boolean
  expanded?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 border-b border-border px-3 py-2.5 text-left last:border-none"
    >
      <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-secondary">
        <Icon size={14} strokeWidth={1.8} className={danger ? "text-destructive" : "text-ink-soft"} />
      </div>
      <div className="flex-1">
        <div className={`text-[12.5px] font-semibold ${danger ? "text-destructive" : ""}`}>{label}</div>
        {preview && <div className="mt-0.5 text-[10px] font-medium text-ink-faint">{preview}</div>}
      </div>
      <ChevronRight size={14} className={`text-ink-faint transition-transform ${expanded ? "rotate-90" : ""}`} />
    </button>
  )
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex rounded-lg bg-secondary p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md px-2 py-1 text-[10px] font-semibold ${
            value === opt.value ? "bg-card text-foreground shadow-sm" : "text-ink-faint"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
