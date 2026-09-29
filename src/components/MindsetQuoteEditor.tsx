// 마음가짐 문구 편집: 추가·수정·색 지정·삭제·길게 눌러 순서 바꾸기
import { useState } from "react"
import { ChevronRight, Feather, Trash2, Check, GripVertical } from "lucide-react"
import { useAppData } from "@/context/AppDataContext"
import { useT } from "@/lib/i18n"
import { useListReorder } from "@/lib/useListReorder"
import { MINDSET_COLOR_KEYS, mindsetBgVar, MINDSET_COLOR_LABEL_KEY, type MindsetColorKey } from "@/lib/mindsetColors"
import { SectionLabel, Group, Row, Segmented } from "./SettingsUI"
import type { AppSettings } from "@/lib/types"

// 마음가짐 문구 목록 관리(추가/수정/삭제/순서·색 변경). 원래 설정 탭 안에서만 열 수
// 있었는데, 마음가짐 탭에서 바로 열 수 있도록 옮겨왔다 — 이 화면 자체는 그대로다.
export function MindsetQuoteEditor({ onBack }: { onBack: () => void }) {
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              if (!text.trim()) return
              addMindsetQuote(text.trim(), newColor)
              setText("")
            }
          }}
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
