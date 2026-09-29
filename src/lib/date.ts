// 날짜 문자열 처리와 언어별 날짜 표기
import type { Lang } from "./i18n"

// 오늘 날짜 "YYYY-MM-DD"
export function todayStr(): string {
  return toDateStr(new Date())
}

// Date를 "YYYY-MM-DD"로 바꾼다
export function toDateStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

// 요일/월 이름만 언어별로 바뀌고, "월-일-요일" 숫자 구조 자체는 통일한다(의도적 결정).
// 일요일(0) 시작 — Date#getDay()와 같은 인덱스.
export const WEEKDAY: Record<Lang, string[]> = {
  ko: ["일", "월", "화", "수", "목", "금", "토"],
  ja: ["日", "月", "火", "水", "木", "金", "土"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
}

export const WEEKDAY_HEADER: Record<Lang, string[]> = {
  ko: ["월", "화", "수", "목", "금", "토", "일"],
  ja: ["月", "火", "水", "木", "金", "土", "日"],
  en: ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"],
}

// 영어 월 이름
const MONTH_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

// "7월 29일 수요일" 형식 (언어별)
export function formatDateLong(dateStr: string, lang: Lang = "ko"): string {
  const d = new Date(dateStr + "T00:00:00")
  const w = WEEKDAY[lang][d.getDay()]
  if (lang === "ja") return `${d.getMonth() + 1}月${d.getDate()}日 ${w}曜日`
  if (lang === "en") return `${MONTH_EN[d.getMonth()]} ${d.getDate()} (${w})`
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${w}요일`
}

// "7월 29일 (수)" 형식 (언어별)
export function formatDateShort(dateStr: string, lang: Lang = "ko"): string {
  const d = new Date(dateStr + "T00:00:00")
  const w = WEEKDAY[lang][d.getDay()]
  if (lang === "ja") return `${d.getMonth() + 1}月${d.getDate()}日（${w}）`
  if (lang === "en") return `${MONTH_EN[d.getMonth()].slice(0, 3)} ${d.getDate()} (${w})`
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${w})`
}

// "7월 29일" 형식 (언어별)
export function formatMonthDay(dateStr: string, lang: Lang = "ko"): string {
  const d = new Date(dateStr + "T00:00:00")
  if (lang === "ja") return `${d.getMonth() + 1}月${d.getDate()}日`
  if (lang === "en") return `${MONTH_EN[d.getMonth()].slice(0, 3)} ${d.getDate()}`
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

// "2026년 7월" 형식 (언어별)
export function formatMonthLabel(year: number, month0: number, lang: Lang = "ko"): string {
  if (lang === "ja") return `${year}年${month0 + 1}月`
  if (lang === "en") return `${MONTH_EN[month0]} ${year}`
  return `${year}년 ${month0 + 1}월`
}

// 오늘보다 뒤의 날짜인지
export function isFuture(dateStr: string): boolean {
  return dateStr > todayStr()
}

// 오늘이거나 지난 날짜인지
export function isPastOrToday(dateStr: string): boolean {
  return dateStr <= todayStr()
}

// 월요일 시작 요일 인덱스 (0=월 ... 6=일), Date#getDay()(0=일)를 변환
export function mondayIndex(getDay: number): number {
  return (getDay + 6) % 7
}

// 달력 주 시작 요일 설정 (월요일·일요일)
export type WeekStart = "mon" | "sun"

// 기록 탭 달력의 주 시작 요일 설정에 맞춘 인덱스 변환 (0=그 주의 첫 칸 ... 6=마지막 칸).
export function weekStartIndex(getDay: number, weekStart: WeekStart): number {
  return weekStart === "sun" ? getDay : mondayIndex(getDay)
}

// 기록 탭 달력 헤더 전용 — weekStart에 따라 요일 순서를 바꾼다.
// TaskAddSheet의 "요일 선택" 피커는 이 설정과 무관하게 항상 월요일 시작을 유지하므로
// 거기서는 이 함수 대신 기존 WEEKDAY_HEADER를 그대로 쓴다.
export function weekdayHeaderFor(lang: Lang, weekStart: WeekStart): string[] {
  return weekStart === "sun" ? WEEKDAY[lang] : WEEKDAY_HEADER[lang]
}
