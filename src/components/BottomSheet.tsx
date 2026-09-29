// 아래에서 올라오는 바텀시트 공용 컴포넌트 (vaul 기반, 아래로 밀면 닫힌다)
import { Drawer } from "vaul"
import { X } from "lucide-react"
import type { ReactNode } from "react"
import { useT } from "@/lib/i18n"

// 시트 속성: 열림 상태, 제목, 저장 버튼 설정
interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  onSave?: () => void
  saveLabel?: string
  saveDisabled?: boolean
  children: ReactNode
}

// 아래에서 올라오는 바텀시트. 아래로 쓸어내리면 저장하지 않고 닫힌다(=취소).
// 드래그 물리는 vaul(오픈소스, MIT)에 위임 — 직접 제스처를 구현하지 않는다.
export function BottomSheet({
  open,
  onOpenChange,
  title,
  onSave,
  saveLabel,
  saveDisabled,
  children,
}: BottomSheetProps) {
  const t = useT()
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-foreground/35" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 flex max-h-[86vh] flex-col rounded-t-3xl bg-background outline-none">
          <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-input" />
          <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 items-center justify-center text-ink-soft"
              aria-label={t("common_cancel")}
            >
              <X size={20} strokeWidth={1.8} />
            </button>
            <Drawer.Title className="text-[15px] font-bold">{title}</Drawer.Title>
            {onSave ? (
              <button
                type="button"
                onClick={onSave}
                disabled={saveDisabled}
                className="text-[12.5px] font-bold text-primary disabled:opacity-40"
              >
                {saveLabel ?? t("common_save")}
              </button>
            ) : (
              <div className="w-7" />
            )}
          </div>
          <div className="overflow-y-auto px-4 pb-8">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
