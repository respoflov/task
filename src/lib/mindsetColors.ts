import type { TKey } from "./i18n"

// 마음가짐 팝업/탭의 배경색 후보. 실제 색상 값은 src/index.css의 --mind-bg-{key} 변수에 있다
// (라이트/다크 각각 정의되어 있어 여기서는 테마를 신경 쓸 필요가 없다).
// 문구 색상뿐 아니라, "내 이름표"(기기 식별용 색)에도 같은 팔레트를 재사용한다.
export const MINDSET_COLOR_KEYS = ["terracotta", "indigo", "plum", "deepgreen", "olive", "charcoal"] as const

export type MindsetColorKey = (typeof MINDSET_COLOR_KEYS)[number]

export function mindsetBgVar(key: MindsetColorKey): string {
  return `var(--mind-bg-${key})`
}

export const MINDSET_COLOR_LABEL_KEY: Record<MindsetColorKey, TKey> = {
  terracotta: "mindset_color_terracotta",
  indigo: "mindset_color_indigo",
  plum: "mindset_color_plum",
  deepgreen: "mindset_color_deepgreen",
  olive: "mindset_color_olive",
  charcoal: "mindset_color_charcoal",
}
