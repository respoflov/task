import type { AppSettings, MindsetQuote } from "./types"

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
