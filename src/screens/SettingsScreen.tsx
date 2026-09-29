// 설정 탭: 테마·언어·주 시작 요일·랜딩 탭·마음가짐·동기화·백업·라이선스·버전
import { useRef, useState } from "react"
import {
  Sun,
  Globe,
  CalendarDays,
  Home,
  UserRound,
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
} from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { useT, useSubtitle } from "@/lib/i18n"
import { isSyncConfigured } from "@/lib/sync"
import { MINDSET_COLOR_KEYS, mindsetBgVar, MINDSET_COLOR_LABEL_KEY } from "@/lib/mindsetColors"
import { CodeBoxInput } from "@/components/CodeBoxInput"
import { SectionLabel, Group, Row, ClickRow, Segmented } from "@/components/SettingsUI"
import type { AppSettings } from "@/lib/types"

// 설정 탭 본체
export function SettingsScreen() {
  const { data, updateSettings, exportData, importData, resetAllData } = useAppData()
  const t = useT()
  const subtitle = useSubtitle("nav_settings")
  const [installOpen, setInstallOpen] = useState(false)
  const [licenseView, setLicenseView] = useState(false)
  const [syncView, setSyncView] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
        <Row
          icon={Home}
          label={t("settings_landing_tab")}
          right={
            <Segmented
              value={data.settings.landingTab}
              options={[
                { value: "today", label: t("nav_today") },
                { value: "project", label: t("nav_project") },
                { value: "record", label: t("nav_record") },
              ]}
              onChange={(v) => updateSettings({ landingTab: v as AppSettings["landingTab"] })}
            />
          }
        />
      </Group>

      <SectionLabel>{t("settings_section_identity")}</SectionLabel>
      <Group>
        <div className="flex items-center gap-2.5 border-b border-border px-3 py-2.5 last:border-none">
          <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-secondary">
            <UserRound size={14} strokeWidth={1.8} className="text-ink-soft" />
          </div>
          <input
            value={data.settings.deviceLabel ?? ""}
            onChange={(e) => updateSettings({ deviceLabel: e.target.value || null })}
            placeholder={t("settings_identity_name_placeholder")}
            className="flex-1 bg-transparent text-[12.5px] font-semibold text-foreground placeholder:font-medium placeholder:text-ink-faint focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-3">
          {MINDSET_COLOR_KEYS.map((key) => {
            const selected = data.settings.deviceColor === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => updateSettings({ deviceColor: key })}
                aria-label={t(MINDSET_COLOR_LABEL_KEY[key])}
                className="relative h-7 w-7 shrink-0 rounded-full"
                style={{
                  background: mindsetBgVar(key),
                  boxShadow: selected ? "0 0 0 2px var(--card), 0 0 0 3.5px var(--ink-soft)" : undefined,
                }}
              >
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check size={12} strokeWidth={3} color="#F3EADD" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </Group>
      <p className="mt-2 px-1 text-[10.5px] font-medium leading-relaxed text-ink-faint">
        {t("settings_identity_hint")}
      </p>

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
        <ClickRow
          icon={Smartphone}
          label={t("settings_install")}
          expanded={installOpen}
          onClick={() => setInstallOpen((v) => !v)}
        />
        {installOpen && (
          <div className="border-b border-border bg-secondary/40 px-3.5 py-3 last:border-none">
            <div>
              <div className="text-[11.5px] font-bold text-ink-soft">{t("settings_install_ios_label")}</div>
              <div className="mt-1 text-[11px] font-medium leading-relaxed text-ink-soft">
                {t("settings_install_ios_intro")}
              </div>
              <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-[11.5px] font-medium leading-relaxed">
                <li>{t("settings_install_ios_step1")}</li>
                <li>{t("settings_install_ios_step2")}</li>
                <li>{t("settings_install_ios_step3")}</li>
                <li>{t("settings_install_ios_step4")}</li>
              </ol>
            </div>
            <div className="mt-3">
              <div className="text-[11.5px] font-bold text-ink-soft">{t("settings_install_android_label")}</div>
              <div className="mt-1 text-[11px] font-medium leading-relaxed text-ink-soft">
                {t("settings_install_android_intro")}
              </div>
              <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-[11.5px] font-medium leading-relaxed">
                <li>{t("settings_install_android_step1")}</li>
                <li>{t("settings_install_android_step2")}</li>
                <li>{t("settings_install_android_step3")}</li>
                <li>{t("settings_install_android_step4")}</li>
              </ol>
            </div>
          </div>
        )}
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

// 기기 간 동기화 설정 화면 (코드 만들기·입력·지금 동기화·해제)
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
          <p className="mt-2 px-1 text-[10.5px] font-medium leading-relaxed text-ink-faint">
            {t("sync_pairing_hint")}
          </p>

          {enterOpen && (
            <div className="mt-2 rounded-[12px] bg-secondary px-3.5 py-3">
              <CodeBoxInput value={codeInput} onChange={setCodeInput} length={8} autoFocus />
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
          <p className="mt-2 px-1 text-[11.5px] font-medium leading-relaxed text-ink-soft">
            {t("sync_connected_intro")}
          </p>
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

          <p className="mb-1.5 mt-3 px-1 text-[10.5px] font-medium leading-relaxed text-ink-faint">
            {t("sync_now_explain")}
          </p>
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
          <p className="mt-2 px-1 text-[10.5px] font-medium leading-relaxed text-ink-faint">
            {t("sync_new_code_hint")}
          </p>

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

// 오픈소스 라이선스 목록 데이터
const LICENSE_ENTRIES = [
  { name: "Pretendard", license: "SIL OFL 1.1", descKey: "settings_license_pretendard_desc" as const },
  { name: "Lucide Icons", license: "ISC", descKey: "settings_license_lucide_desc" as const },
  { name: "Tabler Icons", license: "MIT", descKey: "settings_license_tabler_desc" as const },
  { name: "vaul", license: "MIT", descKey: "settings_license_vaul_desc" as const },
  { name: "Supabase JS", license: "MIT", descKey: "settings_license_supabase_desc" as const },
]

// 오픈소스 라이선스 화면
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
