import { useRef, useState } from "react"
import {
  Sun,
  Globe,
  Feather,
  Download,
  Upload,
  Trash2,
  Smartphone,
  ShieldCheck,
  Info,
  ChevronRight,
} from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { useT } from "@/lib/i18n"
import type { AppSettings } from "@/lib/types"

export function SettingsScreen() {
  const { data, updateSettings, exportData, importData, resetAllData } = useAppData()
  const t = useT()
  const [quoteView, setQuoteView] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (quoteView) return <MindsetQuoteSettings onBack={() => setQuoteView(false)} />

  return (
    <div className="h-full overflow-y-auto px-4 pb-6 pt-1">
      <h1 className="py-2 text-[19px] font-bold tracking-tight">{t("settings_title")}</h1>

      <SectionLabel>{t("settings_section_display")}</SectionLabel>
      <Group>
        <Row
          icon={Sun}
          label={t("settings_theme")}
          right={
            <Segmented
              value={data.settings.theme}
              options={[
                { value: "light", label: t("settings_theme_light") },
                { value: "system", label: t("settings_theme_system") },
                { value: "dark", label: t("settings_theme_dark") },
              ]}
              onChange={(v) => updateSettings({ theme: v as AppSettings["theme"] })}
            />
          }
        />
        <Row
          icon={Globe}
          label={t("settings_language")}
          right={
            <Segmented
              value={data.settings.language}
              options={[
                { value: "ko", label: t("settings_lang_ko") },
                { value: "ja", label: t("settings_lang_ja") },
                { value: "en", label: t("settings_lang_en") },
              ]}
              onChange={(v) => updateSettings({ language: v as AppSettings["language"] })}
            />
          }
        />
      </Group>

      <SectionLabel>{t("settings_section_mindset")}</SectionLabel>
      <Group>
        <ClickRow
          icon={Feather}
          label={t("settings_mindset_edit")}
          preview={data.mindsetQuotes[0]?.text ? `"${data.mindsetQuotes[0].text.slice(0, 16)}…"` : undefined}
          onClick={() => setQuoteView(true)}
        />
      </Group>

      <SectionLabel>{t("settings_section_data")}</SectionLabel>
      <Group>
        <ClickRow icon={Download} label={t("settings_data_export")} onClick={exportData} />
        <ClickRow
          icon={Upload}
          label={t("settings_data_import")}
          onClick={() => {
            setImportMsg(null)
            fileInputRef.current?.click()
          }}
        />
        <ClickRow icon={Trash2} label={t("settings_data_reset")} danger onClick={() => setConfirmReset(true)} />
      </Group>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          if (!file) return
          const ok = await importData(file)
          setImportMsg({
            ok,
            text: ok ? t("settings_import_success") : t("settings_import_error"),
          })
        }}
      />
      {importMsg && (
        <div
          className={`mt-2 rounded-[10px] px-3 py-2.5 text-[11px] font-semibold leading-relaxed ${
            importMsg.ok ? "bg-accent text-accent-foreground" : "bg-destructive/10 text-destructive"
          }`}
        >
          {importMsg.text}
        </div>
      )}
      {confirmReset && (
        <div className="mt-2 rounded-[12px] border border-destructive/30 bg-destructive/10 px-3.5 py-3">
          <div className="text-[12px] font-bold text-destructive">{t("settings_reset_confirm_title")}</div>
          <div className="mt-1 text-[10.5px] font-medium leading-relaxed text-ink-soft">
            {t("settings_reset_confirm_body")}
          </div>
          <div className="mt-2.5 flex gap-2">
            <button
              type="button"
              onClick={() => {
                resetAllData()
                setConfirmReset(false)
              }}
              className="rounded-lg bg-destructive px-3 py-1.5 text-[11px] font-bold text-white"
            >
              {t("settings_reset_confirm_action")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-bold text-ink-soft"
            >
              {t("common_cancel")}
            </button>
          </div>
        </div>
      )}

      <SectionLabel>{t("settings_section_info")}</SectionLabel>
      <Group>
        <ClickRow icon={Smartphone} label={t("settings_install")} onClick={() => {}} />
        <ClickRow icon={ShieldCheck} label={t("settings_license")} preview="Pretendard · Lucide Icons · Tabler Icons · vaul" onClick={() => {}} />
        <Row icon={Info} label={t("settings_version")} right={<span className="text-[11.5px] font-medium text-ink-faint">{__APP_VERSION__}</span>} />
      </Group>

      <div className="respoflov-mark mb-1 mt-6 text-center">RESPOFLOV</div>
    </div>
  )
}

function MindsetQuoteSettings({ onBack }: { onBack: () => void }) {
  const { data, addMindsetQuote, removeMindsetQuote, updateSettings } = useAppData()
  const t = useT()
  const [text, setText] = useState("")

  return (
    <div className="flex h-full flex-col px-4 pb-6 pt-1">
      <div className="relative flex items-center justify-center py-2">
        <button
          type="button"
          onClick={onBack}
          className="absolute left-0 flex h-7 w-7 items-center justify-center text-ink-soft"
          aria-label={t("common_cancel")}
        >
          <ChevronRight size={18} className="rotate-180" strokeWidth={1.8} />
        </button>
        <h2 className="text-[15px] font-bold">{t("mindset_quotes_title")}</h2>
      </div>

      <SectionLabel>{t("mindset_quotes_order_section")}</SectionLabel>
      <Group>
        <Row
          icon={Feather}
          label={t("mindset_quotes_order_label")}
          right={
            <Segmented
              value={data.settings.mindsetOrder}
              options={[
                { value: "random", label: t("mindset_quotes_random") },
                { value: "sequential", label: t("mindset_quotes_sequential") },
              ]}
              onChange={(v) => updateSettings({ mindsetOrder: v as AppSettings["mindsetOrder"] })}
            />
          }
        />
      </Group>

      <SectionLabel>{t("mindset_quotes_list_section", { n: data.mindsetQuotes.length })}</SectionLabel>
      <Group>
        {data.mindsetQuotes.length === 0 && (
          <div className="px-3 py-4 text-[11.5px] font-medium text-ink-faint">{t("mindset_empty")}</div>
        )}
        {data.mindsetQuotes.map((q) => (
          <div key={q.id} className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-none">
            <div className="flex-1 text-[11.5px] font-semibold leading-relaxed">{q.text}</div>
            <button
              type="button"
              onClick={() => removeMindsetQuote(q.id)}
              className="shrink-0 text-[11px] font-bold text-destructive"
            >
              {t("common_delete")}
            </button>
          </div>
        ))}
      </Group>

      <div className="mt-4 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("mindset_quotes_add_placeholder")}
          className="flex-1 rounded-xl border border-input bg-card px-3.5 py-2.5 text-[13px] font-semibold placeholder:font-medium placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ring/40"
        />
        <button
          type="button"
          onClick={() => {
            if (!text.trim()) return
            addMindsetQuote(text.trim())
            setText("")
          }}
          className="rounded-xl bg-primary px-4 text-[12.5px] font-bold text-primary-foreground disabled:opacity-40"
          disabled={!text.trim()}
        >
          {t("common_add")}
        </button>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-1.5 mt-4 px-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-faint first:mt-0.5">
      {children}
    </div>
  )
}

function Group({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-[13px] border border-border bg-card">{children}</div>
}

function Row({
  icon: Icon,
  label,
  right,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  right: React.ReactNode
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

function ClickRow({
  icon: Icon,
  label,
  preview,
  danger,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  label: string
  preview?: string
  danger?: boolean
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
      <ChevronRight size={14} className="text-ink-faint" />
    </button>
  )
}

function Segmented<T extends string>({
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
