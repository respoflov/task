import { useRef, useState } from "react"

// N개 항목의 자유 순서 드래그. Today 탭의 2개짜리 스왑 훅(useSectionReorder)과 달리 임의 개수를 다룬다.
// 드래그 시작 시 모든 항목의 위치를 스냅샷으로 저장해 두고, 드래그 중에는 그 스냅샷 기준으로
// 다른 항목들의 이동 여부만 계산한다(레이아웃을 매 프레임 다시 읽지 않기 위함).
// 설정 탭의 마음가짐 문구 목록, 오늘 탭의 "오늘만" 목록에서 공유해서 쓴다.
export function useListReorder(ids: string[], onCommit: (orderedIds: string[]) => void) {
  const elRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const rectsRef = useRef<Record<string, DOMRect>>({})
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragY, setDragY] = useState(0)
  const startYRef = useRef(0)
  // pointermove/pointerup 판정은 이 ref들로 한다 — dragId/dragY(state)는 리액트 렌더 배치를
  // 거치므로, pointerdown 직후 pointermove가 같은 틱 안에서 연달아 오면 아직 반영 안 된
  // 값(특히 dragId===null)을 읽어 드래그 자체가 무시되는 문제가 있었다.
  const dragIdRef = useRef<string | null>(null)
  const dragYRef = useRef(0)

  const setRef = (id: string) => (el: HTMLDivElement | null) => {
    elRefs.current[id] = el
  }

  const handlePointerDown = (id: string) => (e: React.PointerEvent) => {
    ids.forEach((iid) => {
      const el = elRefs.current[iid]
      if (el) rectsRef.current[iid] = el.getBoundingClientRect()
    })
    startYRef.current = e.clientY
    dragIdRef.current = id
    dragYRef.current = 0
    setDragId(id)
    setDragY(0)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // 일부 환경에서 포인터 캡처가 무의미한 상태일 때 발생 — 무해함
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragIdRef.current) return
    const next = e.clientY - startYRef.current
    dragYRef.current = next
    setDragY(next)
  }

  const handlePointerUp = () => {
    const id = dragIdRef.current
    if (!id) return
    const draggedRect = rectsRef.current[id]
    if (draggedRect) {
      const draggedCenter = draggedRect.top + draggedRect.height / 2 + dragYRef.current
      const ordered = ids
        .map((iid) => {
          if (iid === id) return { id: iid, c: draggedCenter }
          const r = rectsRef.current[iid]
          return { id: iid, c: r ? r.top + r.height / 2 : 0 }
        })
        .sort((a, b) => a.c - b.c)
        .map((x) => x.id)
      onCommit(ordered)
    }
    dragIdRef.current = null
    dragYRef.current = 0
    setDragId(null)
    setDragY(0)
  }

  const shiftFor = (id: string): number => {
    if (!dragId || id === dragId) return 0
    const draggedRect = rectsRef.current[dragId]
    const itemRect = rectsRef.current[id]
    if (!draggedRect || !itemRect) return 0
    const draggedOrigCenter = draggedRect.top + draggedRect.height / 2
    const draggedCurCenter = draggedOrigCenter + dragY
    const itemCenter = itemRect.top + itemRect.height / 2
    if (draggedOrigCenter < itemCenter) {
      return draggedCurCenter > itemCenter ? -draggedRect.height : 0
    }
    return draggedCurCenter < itemCenter ? draggedRect.height : 0
  }

  const styleFor = (id: string): React.CSSProperties => {
    if (id === dragId) {
      return { transform: `translateY(${dragY}px)`, position: "relative", zIndex: 10 }
    }
    const shift = shiftFor(id)
    return { transform: shift !== 0 ? `translateY(${shift}px)` : undefined, transition: "transform 150ms ease" }
  }

  return { setRef, handlePointerDown, handlePointerMove, handlePointerUp, styleFor }
}

// useListReorder가 돌려주는 값의 타입
export type ListReorder = ReturnType<typeof useListReorder>
