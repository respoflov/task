// 마음가짐 문구 선택 규칙
import type { AppSettings, MindsetQuote } from "./types"

// 설정이 무작위면 아무 문구나, 순서대로면 지난번 다음 문구를 고른다
export function pickMindsetQuote(
  quotes: MindsetQuote[],
  settings: Pick<AppSettings, "mindsetOrder" | "lastSequentialIndex">
): MindsetQuote | null {
  if (quotes.length === 0) return null
  const sorted = [...quotes].sort((a, b) => a.order - b.order)
  if (settings.mindsetOrder === "random") {
    return sorted[Math.floor(Math.random() * sorted.length)]
  }
  const next = (settings.lastSequentialIndex + 1) % sorted.length
  return sorted[next]
}
