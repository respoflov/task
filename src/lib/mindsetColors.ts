// 마음가짐 팝업/탭의 배경색 후보. 실제 색상 값은 src/index.css의 --mind-bg-{key} 변수에 있다
// (라이트/다크 각각 정의되어 있어 여기서는 테마를 신경 쓸 필요가 없다).
export const MINDSET_COLOR_KEYS = ["terracotta", "indigo", "plum", "deepgreen", "olive", "charcoal"] as const

export type MindsetColorKey = (typeof MINDSET_COLOR_KEYS)[number]

export function mindsetBgVar(key: MindsetColorKey): string {
  return `var(--mind-bg-${key})`
}
