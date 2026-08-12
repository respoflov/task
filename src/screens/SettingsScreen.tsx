import { useRef, useState } from "react"
import {
  Sun,
  Globe,
  CalendarDays,
  Feather,
  Download,
  Upload,
  Trash2,
  Smartphone,
  ShieldCheck,
  Info,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  GripVertical,
} from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { useT, useSubtitle, type TKey } from "@/lib/i18n"
import { isSyncConfigured } from "@/lib/sync"
import { MINDSET_COLOR_KEYS, mindsetBgVar, type MindsetColorKey } from "@/lib/mindsetColors"
import type { AppSettings } from "@/lib/types"

const MINDSET_COLOR_LABEL_KEY: Record<MindsetColorKey, TKey> = {
  terracotta: "mindset_color_terracotta",
  indigo: "mindset_color_indigo",
  plum: "mindset_color_plum",
  deepgreen: "mindset_color_deepgreen",
  olive: "mindset_color_olive",
  charcoal: "mindset_color_charcoal",
}

export function SettingsScreen() {
  const { data, updateSettings, exportData, importData, resetAllData } = useAppData()
  const t = useT()
  const subtitle = useSubtitle("nav_settings")
  const [quoteView, setQuoteView] = useState(false)
  const [installView, setInstallView] = useState(false)
  const [licenseView, setLicenseView] = useState(false)
  const [syncView, setSyncView] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (quoteView) return <MindsetQuoteSettings onBack={() => setQuoteView(false)} />
  if (installView) return <InstallGuide onBack={() => setInstallView(false)} />
  if (licenseView) return <LicenseList onBack={() => setLicenseView(false)} />
  if (syncView) return <SyncSettings onBack={() => setSyncView(false)} />

  return (
    <div className="h-full overflow-y-auto px-4 pb-6 pt-1">
      <div className="relative py-1.5 pb-3">
        <div className="mb-0.5 text-[11.5px] font-medium text-ink-soft">{subtitle}</div>
        <h1 className="text-[21px] font-bold tracking-tight">{t("settings_title")}</h1>
      </div>

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
        <Row
          icon={CalendarDays}
          label={t("settings_week_start")}
          right={
            <Segmented
              value={data.settings.weekStart}
              options={[
                { value: "mon", label: t("settings_week_start_mon") },
                { value: "sun", label: t("settings_week_start_sun") },
              ]}
              onChange={(v) => updateSettings({ weekStart: v as AppSettings["weekStart"] })}
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

      <SectionLabel>{t("settings_section_sync")}</SectionLabel>
      <Group>
        <ClickRow
          icon={RefreshCw}
          label={t("settings_sync_row")}
          preview={
            !isSyncConfigured()
              ? t("settings_sync_status_unavailable")
              : data.settings.syncCode
                ? t("settings_sync_status_on")
                : t("settings_sync_status_off")
          }
          onClick={() => setSyncView(true)}
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
        <ClickRow icon={Smartphone} label={t("settings_install")} onClick={() => setInstallView(true)} />
        <ClickRow
          icon={ShieldCheck}
          label={t("settings_license")}
          preview="Pretendard · Lucide Icons · Tabler Icons · vaul · Supabase JS"
          onClick={() => setLicenseView(true)}
        />
        <Row icon={Info} label={t("settings_version")} right={<span className="text-[11.5px] font-medium text-ink-faint">{__APP_VERSION__}</span>} />
      </Group>

      <div className="respoflov-mark mb-1 mt-6 text-center">RESPOFLOV</div>
    </div>
  )
}

// N개 항목의 자유 순서 드래그. Today 탭의 2개짜리 스왑 훅과 달리 임의 개수를 다룬다.
// 드래그 시작 시 모든 항목의 위치를 스냅샷으로 저장해 두고, 드래그 중에는 그 스냅샷 기준으로
// 다른 항목들의 이동 여부만 계산한다(레이아웃을 매 프레임 다시 읽지 않기 위함).
function useListReorder(ids: string[], onCommit: (orderedIds: string[]) => void) {
  const elRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const rectsRef = useRef<Record<string, DOMRect>>({})
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragY, setDragY] = useState(0)
  const startYRef = useRef(0)

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    elRefs.current[id] = el
  }

  const handlePointerDown = (id: string) => (e: React.PointerEvent) => {
    ids.forEach((iid) => {
      const el = elRefs.current[iid]
      if (el) rectsRef.current[iid] = el.getBoundingClientRect()
    })
    startYRef.current = e.clientY
    setDragId(id)
    setDragY(0)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 일부 환경에서 포인터 캡처가 무의미한 상태일 때 발생 — 무해함
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragId) return
    setDragY(e.clientY - startYRef.current)
  }

  const handlePointerUp = () => {
    if (!dragId) return
    const draggedRect = rectsRef.current[dragId]
    if (draggedRect) {
      const draggedCenter = draggedRect.top + draggedRect.height / 2 + dragY
      const ordered = ids
        .map((id) => {
          if (id === dragId) return { id, c: draggedCenter }
          const r = rectsRef.current[id]
          return { id, c: r ? r.top + r.height / 2 : 0 }
        })
        .sort((a, b) => a.c - b.c)
        .map((x) => x.id)
      onCommit(ordered)
    }
    setDragId(null)
    setDragY(0)
  }

  const shiftFor = (id: string): number => {
    if (!dragId || id === dragId) return 0
    const draggedRect = rectsRef.current[dragId]
    const itemRect = rectsRef.current[id]
    if (!draggedRect || !itemRect) return 0
    const draggedOrigCenter = draggedRect.top + draggedRect.height / 2
    const draggedCurCenter = draggedOrigCenter + dragY
    const itemCenter = itemRect.top + itemRect.height / 2
    if (draggedOrigCenter < itemCenter) {
      return draggedCurCenter > itemCenter ? -draggedRect.height : 0
    }
    return draggedCurCenter < itemCenter ? draggedRect.height : 0
  }

  const styleFor = (id: string): React.CSSProperties => {
    if (id === dragId) {
      return { transform: `translateY(${dragY}px)`, position: "relative", zIndex: 10 }
    }
    const shift = shiftFor(id)
    return { transform: shift !== 0 ? `translateY(${shift}px)` : undefined, transition: "transform 150ms ease" }
  }

  return { setRef, handlePointerDown, handlePointerMove, handlePointerUp, styleFor }
}

function MindsetQuoteSettings({ onBack }: { onBack: () => void }) {
  const { data, addMindsetQuote, updateMindsetQuote, removeMindsetQuote, reorderMindsetQuotes, updateSettings } =
    useAppData()
  const t = useT()
  const [text, setText] = useState("")
  const [newColor, setNewColor] = useState<MindsetColorKey>("terracotta")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [colorEditId, setColorEditId] = useState<string | null>(null)

  const sortedQuotes = [...data.mindsetQuotes].sort((a, b) => a.order - b.order)
  const reorder = useListReorder(
    sortedQuotes.map((q) => q.id),
    reorderMindsetQuotes
  )

  const startEdit = (id: string, currentText: string) => {
    setColorEditId(null)
    setEditingId(id)
    setEditText(currentText)
  }

  const commitEdit = (id: string) => {
    const trimmed = editText.trim()
    if (trimmed) updateMindsetQuote(id, { text: trimmed })
    setEditingId(null)
  }

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

      <SectionLabel>{t("mindset_quotes_list_section", { n: sortedQuotes.length })}</SectionLabel>
      <Group>
        {sortedQuotes.length === 0 && (
          <div className="px-3 py-4 text-[11.5px] font-medium text-ink-faint">{t("mindset_empty")}</div>
        )}
        {sortedQuotes.map((q) => (
          <div
            key={q.id}
            ref={reorder.setRef(q.id)}
            style={reorder.styleFor(q.id)}
            className="border-b border-border bg-card last:border-none"
          >
            <div className="flex items-center gap-2 px-2.5 py-2.5">
              <button
                type="button"
                onPointerDown={reorder.handlePointerDown(q.id)}
                onPointerMove={reorder.handlePointerMove}
                onPointerUp={reorder.handlePointerUp}
                onPointerCancel={reorder.handlePointerUp}
                aria-label={t("today_reorder_aria")}
                className="flex h-7 w-6 shrink-0 items-center justify-center text-ink-faint"
                style={{ touchAction: "none" }}
              >
                <GripVertical size={15} strokeWidth={1.8} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setColorEditId((cur) => (cur === q.id ? null : q.id))
                }}
                aria-label={t(MINDSET_COLOR_LABEL_KEY[q.color])}
                className="h-6 w-6 shrink-0 rounded-full"
                style={{ background: mindsetBgVar(q.color) }}
              />
              {editingId === q.id ? (
                <input
                  autoFocus
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => commitEdit(q.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur()
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="flex-1 rounded-lg border border-input bg-card px-2 py-1 text-[11.5px] font-semibold focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => startEdit(q.id, q.text)}
                  className="flex-1 truncate text-left text-[11.5px] font-semibold"
                >
                  {q.text}
                </button>
              )}
              <button
                type="button"
                onClick={() => removeMindsetQuote(q.id)}
                aria-label={t("common_delete")}
                className="shrink-0 p-1 text-ink-faint"
              >
                <Trash2 size={14} strokeWidth={1.8} />
              </button>
            </div>
            {colorEditId === q.id && (
              <div className="flex flex-wrap gap-2.5 px-3 pb-3 pl-11">
                {MINDSET_COLOR_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      updateMindsetQuote(q.id, { color: key })
                      setColorEditId(null)
                    }}
                    aria-label={t(MINDSET_COLOR_LABEL_KEY[key])}
                    className="relative h-7 w-7 shrink-0 rounded-full"
                    style={{
                      background: mindsetBgVar(key),
                      boxShadow: q.color === key ? "0 0 0 2px var(--card), 0 0 0 3.5px var(--ink-soft)" : undefined,
                    }}
                  >
                    {q.color === key && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <Check size={12} strokeWidth={3} color="#F3EADD" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
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
            addMindsetQuote(text.trim(), newColor)
            setText("")
          }}
          className="rounded-xl bg-primary px-4 text-[12.5px] font-bold text-primary-foreground disabled:opacity-40"
          disabled={!text.trim()}
        >
          {t("common_add")}
        </button>
      </div>

      <SectionLabel>{t("mindset_color_section")}</SectionLabel>
      <div className="flex gap-3 px-1">
        {MINDSET_COLOR_KEYS.map((key) => {
          const selected = newColor === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setNewColor(key)}
              aria-label={t(MINDSET_COLOR_LABEL_KEY[key])}
              className="relative h-9 w-9 shrink-0 rounded-full"
              style={{
                background: mindsetBgVar(key),
                boxShadow: selected ? "0 0 0 2px var(--card), 0 0 0 3.5px var(--ink-soft)" : undefined,
              }}
            >
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <Check size={15} strokeWidth={3} color="#F3EADD" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SyncSettings({ onBack }: { onBack: () => void }) {
  const { data, syncStatus, syncError, createSyncCode, pairWithSyncCode, syncNow, disableSync } = useAppData()
  const t = useT()
  const lang = data.settings.language
  const [enterOpen, setEnterOpen] = useState(false)
  const [codeInput, setCodeInput] = useState("")
  const [copied, setCopied] = useState(false)
  const [confirmDisable, setConfirmDisable] = useState(false)
  const busy = syncStatus === "syncing"

  const localeMap = { ko: "ko-KR", ja: "ja-JP", en: "en-US" } as const
  const lastSyncedLabel = data.settings.syncUpdatedAt
    ? new Date(data.settings.syncUpdatedAt).toLocaleString(localeMap[lang])
    : t("sync_last_synced_never")

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
        <h2 className="text-[15px] font-bold">{t("settings_sync_row")}</h2>
      </div>

      {!isSyncConfigured() && (
        <div className="mt-2 rounded-[10px] bg-secondary px-3.5 py-3 text-[11.5px] font-medium leading-relaxed text-ink-soft">
          {t("sync_unavailable_notice")}
        </div>
      )}

      {isSyncConfigured() && !data.settings.syncCode && (
        <>
          <p className="mt-2 px-1 text-[11.5px] font-medium leading-relaxed text-ink-soft">{t("sync_explain")}</p>
          <Group>
            <ClickRow
              icon={RefreshCw}
              label={t("sync_create_button")}
              onClick={async () => {
                try {
                  await createSyncCode()
                } catch {
                  // syncError 상태로 이미 반영됨
                }
              }}
            />
            <ClickRow icon={Copy} label={t("sync_enter_button")} onClick={() => setEnterOpen((v) => !v)} />
          </Group>

          {enterOpen && (
            <div className="mt-2 rounded-[12px] bg-secondary px-3.5 py-3">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder={t("sync_enter_placeholder")}
                className="w-full rounded-lg border border-input bg-card px-3 py-2 text-center text-[15px] font-bold tracking-[0.15em] placeholder:font-medium placeholder:tracking-normal placeholder:text-ink-faint focus:outline-none"
              />
              <div className="mt-2 text-[10.5px] font-medium leading-relaxed text-ink-faint">
                {t("sync_enter_warning")}
              </div>
              <button
                type="button"
                disabled={!codeInput.trim() || busy}
                onClick={async () => {
                  const ok = await pairWithSyncCode(codeInput.trim())
                  if (ok) {
                    setEnterOpen(false)
                    setCodeInput("")
                  }
                }}
                className="mt-2.5 w-full rounded-lg bg-primary py-2 text-[12px] font-bold text-primary-foreground disabled:opacity-40"
              >
                {busy ? t("sync_syncing") : t("common_save")}
              </button>
            </div>
          )}
        </>
      )}

      {isSyncConfigured() && data.settings.syncCode && (
        <>
          <SectionLabel>{t("sync_code_label")}</SectionLabel>
          <Group>
            <div className="flex items-center gap-2.5 px-3.5 py-3">
              <div className="flex-1 text-[17px] font-bold tracking-[0.15em]">{data.settings.syncCode}</div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(data.settings.syncCode ?? "")
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                }}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-[10.5px] font-bold text-ink-soft"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t("sync_copied") : t("sync_copy")}
              </button>
            </div>
          </Group>

          <div className="mb-1.5 mt-4 px-1 text-[10.5px] font-bold uppercase tracking-wide text-ink-faint">
            {t("sync_last_synced")}
          </div>
          <div className="px-1 text-[11.5px] font-medium text-ink-soft">{lastSyncedLabel}</div>

          <Group>
            <ClickRow
              icon={RefreshCw}
              label={busy ? t("sync_syncing") : t("sync_now_button")}
              onClick={() => syncNow()}
            />
            <ClickRow
              icon={Trash2}
              label={t("sync_disable_button")}
              danger
              onClick={() => setConfirmDisable(true)}
            />
          </Group>

          {confirmDisable && (
            <div className="mt-2 rounded-[12px] border border-destructive/30 bg-destructive/10 px-3.5 py-3">
              <div className="text-[12px] font-bold text-destructive">{t("sync_disable_confirm_title")}</div>
              <div className="mt-1 text-[10.5px] font-medium leading-relaxed text-ink-soft">
                {t("sync_disable_confirm_body")}
              </div>
              <div className="mt-2.5 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    disableSync()
                    setConfirmDisable(false)
                  }}
                  className="rounded-lg bg-destructive px-3 py-1.5 text-[11px] font-bold text-white"
                >
                  {t("sync_disable_button")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDisable(false)}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-bold text-ink-soft"
                >
                  {t("common_cancel")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {syncError && (
        <div className="mt-2 rounded-[10px] bg-destructive/10 px-3.5 py-2.5 text-[11px] font-semibold text-destructive">
          {syncError === "decrypt-failed" ? t("sync_error_decrypt") : t("sync_error_generic")}
        </div>
      )}
    </div>
  )
}

function InstallGuide({ onBack }: { onBack: () => void }) {
  const t = useT()
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
        <h2 className="text-[15px] font-bold">{t("settings_install")}</h2>
      </div>

      <Group>
        <div className="border-b border-border px-3.5 py-3 last:border-none">
          <div className="text-[11.5px] font-bold text-ink-soft">{t("settings_install_ios_label")}</div>
          <div className="mt-1 text-[12px] font-medium leading-relaxed">{t("settings_install_ios_body")}</div>
        </div>
        <div className="px-3.5 py-3">
          <div className="text-[11.5px] font-bold text-ink-soft">{t("settings_install_android_label")}</div>
          <div className="mt-1 text-[12px] font-medium leading-relaxed">{t("settings_install_android_body")}</div>
        </div>
      </Group>
    </div>
  )
}

const LICENSE_ENTRIES = [
  { name: "Pretendard", license: "SIL OFL 1.1", descKey: "settings_license_pretendard_desc" as const },
  { name: "Lucide Icons", license: "ISC", descKey: "settings_license_lucide_desc" as const },
  { name: "Tabler Icons", license: "MIT", descKey: "settings_license_tabler_desc" as const },
  { name: "vaul", license: "MIT", descKey: "settings_license_vaul_desc" as const },
  { name: "Supabase JS", license: "MIT", descKey: "settings_license_supabase_desc" as const },
]

function LicenseList({ onBack }: { onBack: () => void }) {
  const t = useT()
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
        <h2 className="text-[15px] font-bold">{t("settings_license")}</h2>
      </div>

      <Group>
        {LICENSE_ENTRIES.map((entry) => (
          <div key={entry.name} className="border-b border-border px-3.5 py-3 last:border-none">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12.5px] font-bold">{entry.name}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[9.5px] font-bold text-ink-soft">
                {entry.license}
              </span>
            </div>
            <div className="mt-1 text-[11px] font-medium text-ink-faint">{t(entry.descKey)}</div>
          </div>
        ))}
      </Group>
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
