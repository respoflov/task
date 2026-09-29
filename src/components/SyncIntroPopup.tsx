// 처음 실행할 때 한 번 보여 주는 기기 간 동기화 안내 팝업
import { RefreshCw } from "lucide-react"
import { useT } from "@/lib/i18n"

// 동기화 기능 소개와 「설정으로 가기」·「나중에」 버튼
export function SyncIntroPopup({
  onLater,
  onGoSettings,
}: {
  onLater: () => void
  onGoSettings: () => void
}) {
  const t = useT()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-7 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
        <RefreshCw size={26} strokeWidth={2} className="text-primary" />
      </div>
      <h2 className="text-[17px] font-bold tracking-tight">{t("sync_intro_title")}</h2>
      <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-ink-soft">{t("sync_intro_body")}</p>
      <div className="mt-7 flex w-full flex-col gap-2">
        <button
          type="button"
          onClick={onGoSettings}
          className="w-full rounded-xl bg-primary py-3 text-[13px] font-bold text-primary-foreground"
        >
          {t("sync_intro_go_settings")}
        </button>
        <button type="button" onClick={onLater} className="w-full py-2 text-[12.5px] font-bold text-ink-soft">
          {t("sync_intro_later")}
        </button>
      </div>
    </div>
  )
}
