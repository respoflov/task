import {
  Dumbbell,
  BookOpen,
  Pencil,
  Droplet,
  Moon,
  Flower2,
  Apple,
  Footprints,
  Music,
  Paintbrush,
  Coffee,
  Heart,
  Star,
  Sun,
  CloudRain,
  Leaf,
  Calendar,
  AlarmClock,
  Smile,
  CheckSquare,
  Clock,
  Briefcase,
  Bed,
  PawPrint,
  Pill,
  Stethoscope,
  Trophy,
  Gamepad2,
  type LucideIcon,
  type LucideProps,
} from "lucide-react"

// "아이콘 없음"을 나타내는 특수 키. TASK_ICONS에는 없고, 렌더링하는 쪽에서
// `icon === NONE_ICON` 체크로 아이콘 타일 자체를 그리지 않는다.
export const NONE_ICON = "none"

// Lucide에는 농구공 아이콘이 없다(lucide.dev 검색으로 직접 확인, "ball" 검색 결과 4개 중에도 없음).
// Tabler Icons(MIT, 오픈소스)의 ball-basketball을 그대로 가져왔다 — viewBox 24x24, stroke-width 2,
// round cap/join까지 Lucide와 동일한 규격이라 다른 아이콘들과 톤이 어긋나지 않는다.
function BallBasketball({ size = 24, strokeWidth = 2, color = "currentColor", className, ...rest }: LucideProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...rest}
    >
      <path d="M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
      <path d="M5.65 5.65l12.7 12.7" />
      <path d="M5.65 18.35l12.7 -12.7" />
      <path d="M12 3a9 9 0 0 0 9 9" />
      <path d="M3 12a9 9 0 0 1 9 9" />
    </svg>
  )
}

// Lucide(ISC) 29종 + Tabler(MIT) 1종 + "아이콘 없음" — 할 일 추가 시 선택 가능한 세트.
export const TASK_ICONS: Record<string, LucideIcon> = {
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  pencil: Pencil,
  droplet: Droplet,
  moon: Moon,
  "flower-2": Flower2,
  apple: Apple,
  footprints: Footprints,
  music: Music,
  paintbrush: Paintbrush,
  coffee: Coffee,
  heart: Heart,
  star: Star,
  sun: Sun,
  "cloud-rain": CloudRain,
  leaf: Leaf,
  calendar: Calendar,
  "alarm-clock": AlarmClock,
  smile: Smile,
  "check-square": CheckSquare,
  clock: Clock,
  briefcase: Briefcase,
  bed: Bed,
  "paw-print": PawPrint,
  pill: Pill,
  stethoscope: Stethoscope,
  trophy: Trophy,
  "ball-basketball": BallBasketball,
  "gamepad-2": Gamepad2,
}

export const TASK_ICON_KEYS = [NONE_ICON, ...Object.keys(TASK_ICONS)]

export function getTaskIcon(key: string): LucideIcon {
  return TASK_ICONS[key] ?? TASK_ICONS["check-square"]
}
