# Daily Task Check — system.md

## 방향 & 느낌
"웜 저널" — 아이보리 종이 + 모스 그린 잉크. Superhuman(따뜻한 오프화이트 + 단일 짙은 액센트, 마음가짐 순간만 다른 색으로 전환)에서 구조적 영감을 받았고,
초기 방향 탐색 단계에서 Linear/Raycast(모노 다크)·Notion/Cal.com(소프트 화이트) 두 대안도 나란히 검토했으나 최종적으로 웜 저널 방향을 채택했다(`mockup/design-mockup-v2.html` 참고).

## 색
- 라이트 배경 `#FBF9F5`, 카드 `#FFFFFF`, 서피스 `#F4EFE6`, 헤어라인 `#E8E2D6`
- 다크 배경 `#121212`(중립 블랙, 초록 틴트 금지), 카드 `#1E1E1E`
- 액센트: 라이트 `#4D6152` / 다크 `#8CA290` — 이 하나만 브랜드 색으로 쓴다. 위험(빨강)·요일(토파랑/일빨강)은 별도 고정 색.
- 마음가짐 팝업만 예외적으로 `#5B3A28`(라이트)/`#4A3428`(다크) 테라코타 — 하루 중 유일한 색 전환.
- 전체 토큰은 `src/index.css`의 `:root`/`.dark`에 있다. Tailwind 유틸리티로는 `bg-background`, `text-foreground`, `bg-primary`, `text-ink-soft`, `text-ink-faint`, `border-border`, `bg-secondary`(=surface), `bg-accent`/`text-accent-foreground`(액센트 10~16% 배경 위 액센트 텍스트) 형태로 쓴다.

## 타이포그래피
- Pretendard 하나만 사용(본문·제목 구분 없이 굵기로 위계를 만든다).
- 제목 19~21px/700, 본문 12.5~14px/600, 메타 10~11.5px/500, 라벨 9~11px/700(대문자+letter-spacing).

## 깊이 & 모양
- 그림자 대신 헤어라인 보더 + 서피스 명도 차이로 위계를 만든다(라이트는 카드에 1px 보더, 다크는 헤어라인만).
- 라운드: `--radius: 0.875rem`(14px) 기준으로 sm(8.4)/md(11.2)/lg(14)/xl(19.6)이 파생된다. 카드 14px, 인풋·버튼 11px, 아이콘 타일 9~10px, 칩/뱃지는 pill(999px).
- 아이콘 타일(작업 아이콘, 설정 행 아이콘): 26~30px 정사각, 서피스 배경, 9px 라운드.

## 컴포넌트 패턴
- **체크(완료) 버튼** — 22px 원, 미완료는 `border-input` 1.6px 아웃라인, 완료는 `bg-primary` 풀 + 흰 체크 아이콘. 항목명에는 동시에 취소선(`line-through` + `text-ink-faint`).
- **바텀시트** — `vaul`(MIT) 사용, 직접 구현 금지. 핸들 36×4px pill, 헤더에 닫기(X)/제목/저장 고정. `src/components/BottomSheet.tsx`가 공용 래퍼.
- **세그먼트 컨트롤** — `bg-secondary` 트랙 + `bg-card` 활성 pill(그림자 아주 옅게).
- **기록 히트맵 셀**(`src/components/RatioRingCell.tsx`) — 26px 원, 완료율만큼 도넛 링(stroke, `stroke-linecap round`, -90deg 시작), 100%는 꽉 찬 원 + 흰 숫자, 그 외는 잉크색 숫자. "오늘" 표시는 날짜 숫자를 굵게+액센트 색으로만 하고 별도 테두리 링을 겹치지 않는다(v11에서 이중 테두리 버그를 이렇게 고쳤다). 그날 적용 대상 항목이 하나도 없으면(`total===0`) 링 자체를 그리지 않고 비운다 — "기록 없음"과 "0%로 실패"를 섞지 않기 위함(실제 구현 중 재발견).
- **마일스톤 스테퍼**(`src/screens/ProjectScreen.tsx`) — 완료 처리 시 같은 프로젝트의 다음 "예정" 단계를 자동으로 "진행 중"으로 승격한다.
- **RESPOFLOV 각인** — `.respoflov-mark` 유틸리티 클래스(index.css) 재사용. 9.5px/600/letter-spacing .32em, 스플래시 하단 및 설정 화면 맨 아래에 배치.

## 아이콘
기본은 Lucide(`lucide-react`, ISC). 예외적으로 Lucide에 없는 아이콘(농구공)은 Tabler Icons(MIT)에서 같은 규격(24x24 viewBox, stroke-width 2, round cap/join)의 SVG를 그대로 가져와 컴포넌트로 감쌌다 — 다른 라이브러리를 섞을 땐 반드시 이 규격이 맞는지 먼저 확인한다. 할 일 아이콘 화이트리스트는 `src/lib/icons.tsx`의 `TASK_ICONS`에 고정 — 임의로 추가하지 말고 여기서 관리한다.

## 참고한 외부 레퍼런스
- Superhuman, Notion, Cal.com, Linear/Raycast의 `Claude/_references/awesome-design-md` DESIGN.md — 초기 방향 탐색(v2)에서 색·타이포·깊이 전략을 비교하는 데 참고.
- wwit.design(방문했으나 검색 UI 이슈로 실질적 참고는 못함).
