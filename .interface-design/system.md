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
- **기록 히트맵 셀**(`src/components/RatioRingCell.tsx`) — 26px 원, 완료율만큼 도넛 링(stroke, `stroke-linecap round`, -90deg 시작), 100%는 꽉 찬 원 + 흰 숫자, 그 외는 잉크색 숫자. "오늘" 표시는 날짜 숫자를 굵게+액센트 색으로만 하고 별도 테두리 링을 겹치지 않는다(v11에서 이중 테두리 버그를 이렇게 고쳤다). 그날 적용 대상 항목이 하나도 없으면(`total===0`) 채워진 링 대신 점선 원(`empty` variant, future-count와 같은 "표시할 게 없는 날" 계열)을 그린다 — "기록 없음"과 "0%로 실패"를 섞지 않으면서도(v1.4.0까지는 아예 안 그려서 다른 달 칸과 구분이 안 됐다가, v1.4.1에서 점선으로 바꿔 "달력에 있는 날"이라는 건 알 수 있게 고쳤다).
- **마일스톤 스테퍼**(`src/screens/ProjectScreen.tsx`) — 완료 처리 시 같은 프로젝트의 다음 "예정" 단계를 자동으로 "진행 중"으로 승격한다.
- **RESPOFLOV 각인** — `.respoflov-mark` 유틸리티 클래스(index.css) 재사용. 9.5px/600/letter-spacing .32em, 스플래시 하단 및 설정 화면 맨 아래에 배치.
- **색상 스와치 피커**(마음가짐 배경색, v1.6.0) — 36px(`h-9 w-9`) 원, `gap-3`(12px) 한 줄 배치. 6개를 골랐다: 콘텐츠 폭(~343px, 좌우 16px 패딩 기준)에서 36px 원 6개+간격이 286px로 여유 있게 들어가고(8개부터는 36px에서 줄을 넘긴다), 탭하기 편한 최소 크기(32px 이상)를 지키면서도 "한 줄에 훑어보고 고르는" 색상 피커로는 6~8개가 흔한 상한선이라 그 안에서 딱 떨어지는 수로 정했다. 선택 표시는 체크 아이콘(크림색, 배경이 전부 어두운 톤이라 항상 대비가 확보됨) + 옅은 링(`box-shadow`로 카드색 갭 + ink-soft 테두리, 다른 선택 표시들과 톤을 맞춤).

## 아이콘
기본은 Lucide(`lucide-react`, ISC). 예외적으로 Lucide에 없는 아이콘(농구공)은 Tabler Icons(MIT)에서 같은 규격(24x24 viewBox, stroke-width 2, round cap/join)의 SVG를 그대로 가져와 컴포넌트로 감쌌다 — 다른 라이브러리를 섞을 땐 반드시 이 규격이 맞는지 먼저 확인한다. `LucideIcon` 타입(`ForwardRefExoticComponent`)에 맞춰야 하므로 커스텀 아이콘 컴포넌트는 반드시 `forwardRef`로 감싼다(안 그러면 `TASK_ICONS: Record<string, LucideIcon>` 타입체크가 깨진다). 할 일 아이콘 화이트리스트는 `src/lib/icons.tsx`의 `TASK_ICONS`에 고정 — 임의로 추가하지 말고 여기서 관리한다. 하트·별은 v1.3.0에서 노트북(`laptop`)·금지(`ban`)로 교체했다(둘 다 Lucide).

## 오늘 탭 — 섹션 접힘/드래그, 항목 인라인 편집
- **두 섹션(고정/오늘만) 순서 바꾸기**(`src/screens/TodayScreen.tsx`의 `useSectionReorder`): 섹션이 딱 2개뿐이라 "정렬"이 아니라 "맞바꾸기"로 구현했다. 드래그 중인 섹션만 `transform: translateY()`로 손가락을 따라가고, 상대 섹션은 드래그된 섹션 높이의 절반을 넘어오면 자기 자리로 `transform`해 비켜준다. 실제 DOM 순서(= `settings.todaySectionOrder`)는 손을 뗄 때만 커밋한다 — 드래그 중에는 transform만 바뀌므로 리플로우 없이 부드럽다. `setPointerCapture`는 브라우저에 따라 예외를 던질 수 있어 반드시 `try/catch`로 감싼다.
- **길게 누르기 삭제**(`useLongPress`): 8px 넘게 움직이면 스크롤 의도로 보고 취소한다. 삭제 확인은 `src/components/ui/dialog.tsx`(Base UI Dialog, `--popover`/`--popover-foreground` 토큰이 카드 색과 이미 맞춰져 있어 커스텀 스타일 없이도 앱 톤과 어울린다)를 그대로 쓴다.
- **이름 탭 = 인라인 편집, 아이콘 탭 = 아이콘 변경 시트.** 완료 버튼은 별도 원형 버튼이라 이 둘과 히트 영역이 겹치지 않는다. 아이콘 그리드는 `src/components/IconPicker.tsx`로 분리해 `TaskAddSheet`와 오늘 탭의 "아이콘 변경" 시트가 공유한다.

## 탭 헤더 구조 (5탭 공통)
모든 탭이 [부제목 → 제목 → (선택) 요약] 3단 구조를 공유한다(`mockup/design-mockup-v13.html`에서 승인, v1.3.1 구현).
- 부제목: `text-[11.5px] font-medium text-ink-soft`, `mb-0.5`. 오늘 탭만 실제 날짜(고유 기능이라 예외), 나머지는 `useSubtitle(navKey)` 훅으로 영어/한국어를 언어 설정에 따라 반전해서 보여준다.
- 제목: `text-[21px] font-bold tracking-tight`. 5탭 전부 이 크기로 통일(이전엔 오늘 탭만 21px, 나머지 19px이었다).
- 요약(선택): `text-[11px] font-medium text-ink-faint`, `mt-1`. 오늘 탭의 "오늘 n개 중 n개 완료", 기록 탭의 "전체 보기"/프로젝트명/항목명이 여기 해당 — 기록 탭에서는 이전에 19px 큰 제목이었던 걸 이 크기로 낮추고, "기록"이라는 고정 텍스트가 제목 역할을 대신 맡게 했다.
- 감싸는 wrapper는 `relative py-1.5 pb-3` 하나로 통일 — 부제목·제목·요약 사이 간격은 각각의 `mb-0.5`/`mt-1`로만 주고, 다음 섹션과의 간격은 wrapper의 `pb-3` 하나로 처리한다(이전엔 요소마다 따로 마진을 줘서 탭마다 간격이 미묘하게 달랐다).

## 참고한 외부 레퍼런스
- Superhuman, Notion, Cal.com, Linear/Raycast의 `Claude/_references/awesome-design-md` DESIGN.md — 초기 방향 탐색(v2)에서 색·타이포·깊이 전략을 비교하는 데 참고.
- wwit.design(방문했으나 검색 UI 이슈로 실질적 참고는 못함).
