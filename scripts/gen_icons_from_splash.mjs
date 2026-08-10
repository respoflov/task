// 스플래시 화면(src/components/Splash.tsx)에 실제로 쓰이는 로고(Lucide CalendarCheck2)를
// 그대로 앱 아이콘(192/512/512-maskable)에도 써서 진입 화면과 아이콘이 다른 그림이 되는 걸 막는다.
// CLAUDE.md 푸시 전 점검표: "앱 아이콘이... 진입(스플래시) 화면의 로고와 같은 그림이어야 한다."
import { Resvg } from "@resvg/resvg-js"
import { writeFileSync } from "node:fs"

const GREEN = "#4D6152"
const WHITE = "#FFFFFF"

// lucide-static calendar-check-2.svg 원본 path 그대로 (직접 옮겨 그리지 않고 실제 아이콘 데이터를 사용)
const CALENDAR_CHECK_PATHS = [
  "M 19 3 L 5 3",
  "M 21 13 L 21 5",
  "M 21 5 A2 2 0 0 0 19 3",
  "M 3 19 A2 2 0 0 0 5 21",
  "M 3 5 L 3 19",
  "M 5 3 A2 2 0 0 0 3 5",
  "m16 19 2 2 4-4",
  "M16 2v3",
  "M3 9h18",
  "M5 21 L12.5 21",
  "M8 2v3",
]

function buildSvg({ size, cornerRatio, bgPad, iconScale, roundedBg }) {
  const r = size * cornerRatio
  const iconBoxRatio = 0.5 // Splash: 28px icon in 56px box
  const iconBox = size * iconBoxRatio * iconScale
  const iconOff = (size - iconBox) / 2
  const s = iconBox / 24 // lucide viewBox is 24x24; stroke-width="2" inside the scaled <g> below scales with it

  const bgRect = roundedBg
    ? `<rect x="${bgPad}" y="${bgPad}" width="${size - bgPad * 2}" height="${size - bgPad * 2}" rx="${r}" fill="${WHITE}"/>
       <rect x="${bgPad}" y="${bgPad}" width="${size - bgPad * 2}" height="${size - bgPad * 2}" rx="${r}" fill="${GREEN}" opacity="0.1"/>
       <rect x="${bgPad}" y="${bgPad}" width="${size - bgPad * 2}" height="${size - bgPad * 2}" rx="${r}" fill="none" stroke="${GREEN}" stroke-opacity="0.3" stroke-width="${size / 56}"/>`
    : `<rect x="0" y="0" width="${size}" height="${size}" fill="${WHITE}"/>
       <rect x="0" y="0" width="${size}" height="${size}" fill="${GREEN}" opacity="0.1"/>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    ${bgRect}
    <g transform="translate(${iconOff} ${iconOff}) scale(${s})" fill="none" stroke="${GREEN}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      ${CALENDAR_CHECK_PATHS.map((d) => `<path d="${d}"/>`).join("\n      ")}
    </g>
  </svg>`
}

function render(svg, size, outPath) {
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: size } })
  const png = resvg.render().asPng()
  writeFileSync(outPath, png)
  console.log("wrote", outPath, size)
}

const base = "../public/"

render(buildSvg({ size: 192, cornerRatio: 0.45, bgPad: 0, iconScale: 1, roundedBg: true }), 192, base + "icon-192.png")
render(buildSvg({ size: 512, cornerRatio: 0.45, bgPad: 0, iconScale: 1, roundedBg: true }), 512, base + "icon-512.png")
// maskable: OS가 알아서 마스킹하므로 배경은 코너 없이 꽉 채우고, 안전 영역(가장자리 ~12%)을 비워 아이콘을 더 작게
render(buildSvg({ size: 512, cornerRatio: 0, bgPad: 0, iconScale: 0.72, roundedBg: false }), 512, base + "icon-512-maskable.png")

const faviconSvg = buildSvg({ size: 56, cornerRatio: 0.45, bgPad: 0, iconScale: 1, roundedBg: true })
writeFileSync(base + "favicon.svg", faviconSvg)
console.log("wrote", base + "favicon.svg")
