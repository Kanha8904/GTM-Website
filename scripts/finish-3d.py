"""Trims the rendered 3D images and exports @1x/@2x WebP + PNG."""
from pathlib import Path
from PIL import Image
out = Path(__file__).resolve().parent.parent / "public" / "img" / "3d"
for raw in sorted(out.glob("*-raw.png")):
    name = raw.name.replace("-raw.png", "")
    im = Image.open(raw).convert("RGBA")
    bbox = im.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    pad = 24
    im = im.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad)))
    for scale, w in ((2, min(im.width, 1000)), (1, min(im.width, 1000) // 2)):
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        r.save(out / f"{name}@{scale}x.webp", quality=88, method=6)
        r.save(out / f"{name}@{scale}x.png", optimize=True)
    print(name, im.size, "->", f"@1x {min(im.width,1000)//2}px wide")
    raw.unlink()
