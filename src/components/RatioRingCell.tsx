import { Check } from "lucide-react"

const SIZE = 26
const R = 11
const C = 2 * Math.PI * R

type RingVariant =
  | { kind: "blank" }
  | { kind: "future-empty" }
  | { kind: "future-count"; count: number }
  | { kind: "ratio"; pct: number }
  | { kind: "binary"; done: boolean }

export function RatioRingCell({ variant, selected }: { variant: RingVariant; selected?: boolean }) {
  const center = SIZE / 2
  const selectRing = selected ? (
    <circle cx={center} cy={center} r={R + 2.3} fill="none" stroke="var(--ink-soft)" strokeWidth={1} />
  ) : null

  if (variant.kind === "blank") {
    return <svg width={SIZE} height={SIZE} />
  }

  if (variant.kind === "future-empty") {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={center}
          cy={center}
          r={R}
          fill="none"
          stroke="var(--ink-faint)"
          strokeWidth={1.3}
          strokeDasharray="2 2"
          opacity={0.45}
        />
      </svg>
    )
  }

  if (variant.kind === "future-count") {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle cx={center} cy={center} r={R} fill="none" stroke="var(--input)" strokeWidth={1.6} />
        <text x={center} y={center + 3} textAnchor="middle" className="text-[8px] font-extrabold" fill="var(--foreground)">
          {variant.count}
        </text>
      </svg>
    )
  }

  if (variant.kind === "binary") {
    if (variant.done) {
      return (
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          {selectRing}
          <circle cx={center} cy={center} r={R} fill="var(--primary)" />
          <foreignObject x={center - 7} y={center - 7} width={14} height={14}>
            <Check size={14} strokeWidth={3} color="var(--primary-foreground)" />
          </foreignObject>
        </svg>
      )
    }
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {selectRing}
        <circle cx={center} cy={center} r={R} fill="none" stroke="var(--ring-empty)" strokeWidth={2.2} />
      </svg>
    )
  }

  // ratio
  const pct = Math.max(0, Math.min(100, variant.pct))
  if (pct >= 100) {
    return (
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {selectRing}
        <circle cx={center} cy={center} r={R} fill="var(--primary)" />
        <text x={center} y={center + 2.8} textAnchor="middle" className="text-[7px] font-extrabold" fill="var(--primary-foreground)">
          100
        </text>
      </svg>
    )
  }
  const dash = (pct / 100) * C
  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {selectRing}
      <circle cx={center} cy={center} r={R} fill="none" stroke="var(--ring-empty)" strokeWidth={2.2} />
      {pct > 0 && (
        <circle
          cx={center}
          cy={center}
          r={R}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform={`rotate(-90 ${center} ${center})`}
        />
      )}
      <text x={center} y={center + 2.8} textAnchor="middle" className="text-[7px] font-extrabold" fill="var(--foreground)">
        {pct}
      </text>
    </svg>
  )
}
