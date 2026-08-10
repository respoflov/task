import type { AppSettings, MindsetQuote } from "./types"

export function pickMindsetQuote(
  quotes: MindsetQuote[],
  settings: Pick<AppSettings, "mindsetOrder" | "lastSequentialIndex">
): MindsetQuote | null {
  if (quotes.length === 0) return null
  if (settings.mindsetOrder === "random") {
    return quotes[Math.floor(Math.random() * quotes.length)]
  }
  const next = (settings.lastSequentialIndex + 1) % quotes.length
  return quotes[next]
}
