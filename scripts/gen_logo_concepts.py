# (기록용) 로고 후보 A~D를 한 장에 나란히 그려 비교용 이미지(mockup/logo-concepts-v2.png)를 만드는 스크립트
from PIL import Image, ImageDraw, ImageFont
import math
import os

GREEN = (77, 97, 82, 255)
CREAM = (243, 239, 230, 255)
TILE = 320
PAD = 40
CANVAS_W = TILE * 4 + PAD * 5
CANVAS_H = TILE + PAD * 2 + 60

# 둥근 모서리 초록 배경 타일을 만든다
def rounded_bg(size):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size, size], radius=size * 0.22, fill=GREEN)
    return img, d

# 점 목록을 잇는 굵은 선을 그린다
def thick_line(draw, pts, width, fill):
    draw.line(pts, fill=fill, width=width, joint="curve")
    r = width / 2
    for (x, y) in pts:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=fill)

# 로고 후보 A (데이마크)
def concept_A_daymark(size):
    img, d = rounded_bg(size)
    s = size * 0.68; off = size * 0.16
    def pt(x, y): return (off + x * s, off + y * s)
    d.rounded_rectangle([pt(0.16,0.14)[0], pt(0.16,0.14)[1], pt(0.72,0.70)[0], pt(0.72,0.70)[1]],
                         radius=s*0.09, outline=CREAM, width=max(2,int(s*0.052)))
    cx, cy, r = pt(0.68,0.66)[0], pt(0.68,0.66)[1], s*0.225
    d.ellipse([cx-r, cy-r, cx+r, cy+r], fill=CREAM)
    w = max(2, int(s*0.045))
    thick_line(d, [(cx-r*0.42, cy+r*0.02), (cx-r*0.08, cy+r*0.38), (cx+r*0.48, cy-r*0.32)], w, GREEN)
    return img

# 로고 후보 B (체크리프)
def concept_B_checkleaf(size):
    img, d = rounded_bg(size)
    s = size * 0.72; off = size * 0.14
    def pt(x, y): return (off + x * s, off + y * s)
    leaf = [pt(0.36,0.82), pt(0.30,0.55), pt(0.34,0.30), pt(0.58,0.14),
            pt(0.50,0.34), pt(0.72,0.40), pt(0.66,0.62), pt(0.36,0.82)]
    d.polygon(leaf, fill=CREAM)
    w = max(3, int(s*0.06))
    thick_line(d, [pt(0.36,0.60), pt(0.46,0.72)], w, GREEN)

    return img

# 로고 후보 C (스트릭)
def concept_C_streak(size):
    img, d = rounded_bg(size)
    s = size * 0.72; off = size * 0.14
    def pt(x, y): return (off + x * s, off + y * s)
    dots = [(0.28,0.74,0.06),(0.44,0.58,0.075),(0.64,0.38,0.10)]
    prev=None
    for (x,y,r) in dots:
        cx,cy = pt(x,y); rr = r*s
        if prev:
            thick_line(d,[prev,(cx,cy)],max(2,int(s*0.02)),(255,255,255,110))
        prev=(cx,cy)
    for i,(x,y,r) in enumerate(dots):
        cx,cy = pt(x,y); rr=r*s
        op = 120+ i*68
        d.ellipse([cx-rr,cy-rr,cx+rr,cy+rr], fill=(CREAM[0],CREAM[1],CREAM[2], min(255,op)))
    cx,cy = pt(0.64,0.38); rr=0.10*s
    w=max(2,int(s*0.035))
    thick_line(d,[(cx-rr*0.4,cy+rr*0.05),(cx-rr*0.05,cy+rr*0.4),(cx+rr*0.5,cy-rr*0.35)],w,GREEN)
    return img

# 로고 후보 D (스트로크)
def concept_D_stroke(size):
    img, d = rounded_bg(size)
    s = size * 0.72; off = size * 0.14
    def pt(x, y): return (off + x * s, off + y * s)
    pts = [pt(0.20,0.34), pt(0.46,0.16), pt(0.36,0.42), pt(0.62,0.30),
           pt(0.78,0.52), pt(0.44,0.74), pt(0.20,0.60), pt(0.28,0.80)]
    w = max(4, int(s*0.075))
    thick_line(d, pts, w, CREAM)
    return img

concepts = [
    ("A · 데이 마크 (현재 적용)", concept_A_daymark),
    ("B · 체크 리프", concept_B_checkleaf),
    ("C · 연속선", concept_C_streak),
    ("D · 한 획 스트로크", concept_D_stroke),
]

sheet = Image.new("RGBA", (CANVAS_W, CANVAS_H), (28,26,24,255))
draw = ImageDraw.Draw(sheet)
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/AppleSDGothicNeo.ttc", 20)
except Exception:
    font = ImageFont.load_default()

for i, (label, fn) in enumerate(concepts):
    tile = fn(TILE)
    x = PAD + i * (TILE + PAD)
    y = PAD
    sheet.paste(tile, (x, y), tile)
    bbox = draw.textbbox((0,0), label, font=font)
    tw = bbox[2]-bbox[0]
    draw.text((x + TILE/2 - tw/2, y + TILE + 14), label, fill=(230,230,228,255), font=font)

out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mockup", "logo-concepts-v2.png")
sheet.save(out)
print("wrote", out, sheet.size)
