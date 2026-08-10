from PIL import Image, ImageDraw
import math

GREEN = (77, 97, 82, 255)      # #4D6152
CREAM = (243, 239, 230, 255)   # #F3EFE6

def rounded_rect(draw, box, radius, **kw):
    draw.rounded_rectangle(box, radius=radius, **kw)

def thick_line(draw, pts, width, fill):
    draw.line(pts, fill=fill, width=width, joint="curve")
    r = width / 2
    for (x, y) in pts:
        draw.ellipse([x - r, y - r, x + r, y + r], fill=fill)

def draw_mark(size, bg, mark, pad_ratio):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size, size], radius=size * 0.22, fill=bg)

    s = size * (1 - pad_ratio * 2)
    off = size * pad_ratio
    def pt(x, y):
        return (off + x * s, off + y * s)

    # calendar-frame square (day cell)
    fr = [pt(0.16, 0.14), pt(0.72, 0.14), pt(0.72, 0.70), pt(0.16, 0.70)]
    d.rounded_rectangle([fr[0][0], fr[0][1], fr[2][0], fr[2][1]], radius=s*0.09, outline=mark, width=max(2, int(s*0.052)))

    # stamp circle bottom-right, overlapping the frame's corner
    c_cx, c_cy, c_r = pt(0.68, 0.66)[0], pt(0.68, 0.66)[1], s * 0.225
    d.ellipse([c_cx - c_r, c_cy - c_r, c_cx + c_r, c_cy + c_r], fill=mark)

    # checkmark inside the stamp, in bg color
    w = max(2, int(s * 0.045))
    p1 = (c_cx - c_r * 0.42, c_cy + c_r * 0.02)
    p2 = (c_cx - c_r * 0.08, c_cy + c_r * 0.38)
    p3 = (c_cx + c_r * 0.48, c_cy - c_r * 0.32)
    thick_line(d, [p1, p2, p3], w, bg)

    return img

def save(img, path):
    img.save(path)
    print("wrote", path, img.size)

base = "../public/"

save(draw_mark(192, GREEN, CREAM, 0.16), base + "icon-192.png")
save(draw_mark(512, GREEN, CREAM, 0.16), base + "icon-512.png")
save(draw_mark(512, GREEN, CREAM, 0.24), base + "icon-512-maskable.png")
