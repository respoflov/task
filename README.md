# Daily Task Check

매일의 고정 할 일을 체크하고, 기록을 쌓고, 장기 프로젝트를 관리하는 개인용 습관 체크 PWA. 계정/로그인 없이 기기 로컬에만 저장됩니다.
디자인 결정 배경은 [DESIGN.md](./DESIGN.md), 진행 이력은 [히스토리.md](./히스토리.md), 승인 과정은 `mockup/`을 참고하세요.

## 스택

- **React 19 + Vite** · **Tailwind CSS v4** · **shadcn/ui + Base UI** · **vite-plugin-pwa**
- **Pretendard**(한글 폰트, self-host) · **Lucide**(아이콘, `lucide-react`) · **vaul**(바텀시트 드래그 제스처)

## 개발

```bash
npm install
npm run dev
```

앱 아이콘(`public/icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `favicon.svg`)은 스플래시 화면(`src/components/Splash.tsx`)의 로고(Lucide `CalendarCheck2`)를 그대로 가져와 생성합니다 — 진입 화면과 아이콘이 서로 다른 그림이 되지 않도록. 로고를 바꾸면 `scripts/gen_icons_from_splash.mjs`의 `CALENDAR_CHECK_PATHS`를 새 아이콘의 실제 SVG path로 교체한 뒤 재실행하세요:

```bash
node scripts/gen_icons_from_splash.mjs
```

(`scripts/gen_icons.py`는 이전 로고 시안 때 Pillow로 직접 그렸던 스크립트로, 기록용으로 남겨뒀습니다 — 더 이상 아이콘 생성에 쓰지 않습니다.)

## 배포

`npm run build`로 나오는 `dist/` 폴더가 정적 결과물입니다. PWA 기능(홈 화면 추가, 오프라인 캐싱)도 정적 빌드 결과물에서 그대로 동작합니다.

## 참고

- `npm audit`에서 `vite-plugin-pwa` → `workbox-build` 경유 transitive 의존성에 high severity 권고가 뜰 수 있습니다. 빌드 타임에만 쓰이는 개발 도구 체인이라 배포 결과물에는 포함되지 않습니다.

## 라이선스

Copyright 2026 respoflov

이 저장소의 코드는 [Apache License 2.0](LICENSE)을 따릅니다. 앱이 사용하는 외부 폰트·라이브러리는 각자의 라이선스를 따릅니다.
