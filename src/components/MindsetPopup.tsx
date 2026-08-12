import { useAppData } from "@/context/AppDataContext"
import { pickMindsetQuote } from "@/lib/mindset"
import { mindsetBgVar } from "@/lib/mindsetColors"
import { useT } from "@/lib/i18n"

export function MindsetPopup({ onDismiss }: { onDismiss: () => void }) {
  const { data } = useAppData()
  const t = useT()
  const quote = pickMindsetQuote(data.mindsetQuotes, data.settings)

  return (
    <button
      type="button"
      onClick={onDismiss}
      className="flex h-full w-full flex-col items-center justify-center px-7 text-center"
      style={{ background: mindsetBgVar(quote?.color ?? "terracotta") }}
    >
      <div className="mb-1 font-serif text-4xl font-bold opacity-70" style={{ color: "var(--mind-ink)" }}>
        “
      </div>
      <p
        className="text-[18.5px] font-bold leading-[1.7] tracking-tight"
        style={{ color: "var(--mind-ink)" }}
      >
        {quote?.text ?? t("mindset_popup_fallback")}
      </p>
      <div className="mt-8 text-[11px] font-semibold opacity-55" style={{ color: "var(--mind-ink)" }}>
        {t("mindset_popup_hint")}
      </div>
    </button>
  )
}
