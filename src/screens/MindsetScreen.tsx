import { Pencil } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { pickMindsetQuote } from "@/lib/mindset"
import { useT } from "@/lib/i18n"
import type { TabKey } from "@/components/BottomNav"

export function MindsetScreen({ onNavigate }: { onNavigate: (tab: TabKey) => void }) {
  const { data } = useAppData()
  const t = useT()
  const quote = pickMindsetQuote(data.mindsetQuotes, data.settings)

  return (
    <div className="h-full overflow-y-auto px-4 pb-4 pt-1">
      <div className="py-1.5 pb-3 text-[11.5px] font-medium text-ink-soft">{t("mindset_label")}</div>

      <div
        className="flex min-h-[150px] flex-col justify-center rounded-[16px] px-5 py-5 text-center"
        style={{ background: "var(--mind-bg)" }}
      >
        <div className="mb-1 font-serif text-[26px] font-bold opacity-65" style={{ color: "var(--mind-ink)" }}>
          “
        </div>
        <p className="text-[15px] font-bold leading-[1.65] tracking-tight" style={{ color: "var(--mind-ink)" }}>
          {quote?.text ?? t("mindset_empty")}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onNavigate("settings")}
        className="mx-auto mt-3 flex items-center gap-1.5 text-[11.5px] font-bold text-primary"
      >
        <Pencil size={13} strokeWidth={1.8} />
        {t("mindset_edit_link")}
      </button>
    </div>
  )
}
