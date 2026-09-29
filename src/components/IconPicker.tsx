// 할 일 아이콘을 고르는 격자
import { TASK_ICON_KEYS, NONE_ICON, getTaskIcon } from "@/lib/icons"

// 아이콘 목록을 보여 주고 고른 아이콘 키를 onChange로 넘긴다
export function IconPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {TASK_ICON_KEYS.map((key) => {
        const selected = key === value
        const isNone = key === NONE_ICON
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-label={isNone ? "no icon" : key}
            className={`flex aspect-square items-center justify-center rounded-[10px] border-[1.6px] ${
              selected
                ? "border-primary bg-accent"
                : isNone
                  ? "border-dashed border-input bg-transparent"
                  : "border-transparent bg-secondary"
            }`}
          >
            {!isNone &&
              (() => {
                const Icon = getTaskIcon(key)
                return <Icon size={16} strokeWidth={1.7} className={selected ? "text-primary" : "text-ink-soft"} />
              })()}
          </button>
        )
      })}
    </div>
  )
}
