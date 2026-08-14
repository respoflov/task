import { useRef, useState } from "react"

// 동기화 코드처럼 정해진 길이의 문자열을 한 칸씩 박스로 보여주며 입력받는다.
// 실제 입력은 투명한 input 하나가 통째로 받는다(붙여넣기 지원, 포커스 관리 단순화) —
// 8개 input을 따로 두고 자동 포커스 이동을 구현하는 대신, 시각적으로만 칸을 나눈다.
export function CodeBoxInput({
  value,
  onChange,
  length,
  autoFocus,
}: {
  value: string
  onChange: (v: string) => void
  length: number
  autoFocus?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  return (
    <div className="relative" onClick={() => inputRef.current?.focus()}>
      <input
        ref={inputRef}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={length}
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        className="absolute inset-0 h-full w-full cursor-default opacity-0"
      />
      <div className="flex gap-[5px]">
        {Array.from({ length }, (_, i) => {
          const active = focused && i === value.length
          return (
            <div
              key={i}
              className={`flex h-11 flex-1 items-center justify-center rounded-lg border-[1.4px] text-[15px] font-bold ${
                active ? "border-primary" : "border-input"
              }`}
            >
              {value[i] ?? ""}
            </div>
          )
        })}
      </div>
    </div>
  )
}
