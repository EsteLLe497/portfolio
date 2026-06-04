from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets"
HERO_PARTS_DIR = OUT_DIR / "hero-parts"
CANVAS = (1920, 1080)

BACKGROUND = Path(r"D:\portfolio site\IMG_0969.jpg")
CUTOUTS = [
    (Path(r"C:\Users\PC_User\Downloads\IMG_1432-removebg-preview.png"), 560, 130, 455, 4),
    (Path(r"C:\Users\PC_User\Downloads\IMG_0326-removebg-preview.png"), 390, 530, 610, -6),
    (Path(r"C:\Users\PC_User\Downloads\IMG_1963-removebg-preview.png"), 410, 820, 595, 3),
    (Path(r"C:\Users\PC_User\Downloads\IMG_1606-removebg-preview.png"), 500, 1165, 480, -4),
    (Path(r"C:\Users\PC_User\Downloads\IMG_1668-removebg-preview.png"), 650, 1470, 395, -2),
]

MAIN_VISUAL_CUTOUTS = [
    (Path(r"C:\Users\PC_User\Downloads\IMG_1432-removebg-preview.png"), 520, 145, 500, 2),
    (Path(r"C:\Users\PC_User\Downloads\IMG_0326-removebg-preview.png"), 360, 500, 650, -5),
    (Path(r"C:\Users\PC_User\Downloads\IMG_1963-removebg-preview.png"), 405, 790, 610, 2),
    (Path(r"C:\Users\PC_User\Downloads\IMG_1606-removebg-preview.png"), 500, 1110, 500, -2),
    (Path(r"C:\Users\PC_User\Downloads\IMG_1668-removebg-preview.png"), 700, 1430, 340, -2),
]

WAIWAI_MAIN_CUTOUTS = [
    ("mouse", Path(r"C:\Users\PC_User\Downloads\IMG_1432-removebg-preview.png"), 430, 25, 265, 3),
    ("mic", Path(r"C:\Users\PC_User\Downloads\IMG_1966-removebg-preview.png"), 360, 150, 305, -5),
    ("backpack", Path(r"C:\Users\PC_User\Downloads\IMG_1321-removebg-preview.png"), 450, 1515, 280, -2),
    ("suit", Path(r"C:\Users\PC_User\Downloads\IMG_1668-removebg-preview.png"), 530, 1690, 245, -2),
    ("meat", Path(r"C:\Users\PC_User\Downloads\IMG_1709-removebg-preview.png"), 335, 70, 735, -7),
    ("white-shirt", Path(r"C:\Users\PC_User\Downloads\IMG_1569-removebg-preview.png"), 310, 500, 720, 3),
    ("yellow", Path(r"C:\Users\PC_User\Downloads\IMG_0326-removebg-preview.png"), 260, 720, 820, -5),
    ("crouch", Path(r"C:\Users\PC_User\Downloads\IMG_1963-removebg-preview.png"), 300, 955, 765, 2),
    ("festival-food", Path(r"C:\Users\PC_User\Downloads\IMG_1178-removebg-preview.png"), 260, 1195, 810, 4),
    ("yukata", Path(r"C:\Users\PC_User\Downloads\IMG_1606-removebg-preview.png"), 300, 1390, 730, -3),
    ("wink", Path(r"C:\Users\PC_User\Downloads\IMG_0868-removebg-preview.png"), 300, 1635, 765, 5),
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path(r"C:\Windows\Fonts\YuGothB.ttc") if bold else Path(r"C:\Windows\Fonts\YuGothM.ttc"),
        Path(r"C:\Windows\Fonts\meiryo.ttc"),
        Path(r"C:\Windows\Fonts\arial.ttf"),
    ]
    for font_path in candidates:
        if font_path.exists():
            return ImageFont.truetype(str(font_path), size)
    return ImageFont.load_default()


def cover_crop(image: Image.Image, size: tuple[int, int], y_bias: float = 0.42) -> Image.Image:
    target_ratio = size[0] / size[1]
    source_ratio = image.width / image.height
    if source_ratio > target_ratio:
      new_width = int(image.height * target_ratio)
      left = (image.width - new_width) // 2
      box = (left, 0, left + new_width, image.height)
    else:
      new_height = int(image.width / target_ratio)
      top = int((image.height - new_height) * y_bias)
      box = (0, top, image.width, top + new_height)
    return image.crop(box).resize(size, Image.Resampling.LANCZOS)


def grade_background(image: Image.Image) -> Image.Image:
    image = ImageOps.autocontrast(image, cutoff=1)
    image = Image.blend(image, Image.new("RGB", image.size, (238, 247, 255)), 0.18)
    glow = image.filter(ImageFilter.GaussianBlur(10))
    image = Image.blend(image, glow, 0.12)
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, image.width, image.height), fill=(255, 245, 218, 34))
    draw.ellipse((-180, -160, 760, 540), fill=(255, 245, 196, 58))
    draw.ellipse((1220, 60, 2100, 880), fill=(128, 198, 235, 38))
    return Image.alpha_composite(image.convert("RGBA"), overlay)


def add_cutout(canvas: Image.Image, path: Path, height: int, x: int, y: int, angle: float) -> None:
    cutout = build_cutout_part(path, height, angle)
    canvas.alpha_composite(cutout, (x, y))


def build_cutout_part(path: Path, height: int, angle: float) -> Image.Image:
    cutout = Image.open(path).convert("RGBA")
    ratio = height / cutout.height
    cutout = cutout.resize((int(cutout.width * ratio), height), Image.Resampling.LANCZOS)
    if angle:
        cutout = cutout.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)

    alpha = cutout.getchannel("A")
    outline_alpha = alpha.filter(ImageFilter.MaxFilter(13)).filter(ImageFilter.GaussianBlur(1.2))
    outline = Image.new("RGBA", cutout.size, (255, 255, 255, 0))
    outline.putalpha(outline_alpha.point(lambda value: min(value, 210)))

    shadow_alpha = alpha.filter(ImageFilter.GaussianBlur(16))
    shadow = Image.new("RGBA", cutout.size, (25, 34, 55, 0))
    shadow.putalpha(shadow_alpha.point(lambda value: int(value * 0.34)))

    part = Image.new("RGBA", (cutout.width + 44, cutout.height + 54), (0, 0, 0, 0))
    part.alpha_composite(shadow, (32, 38))
    part.alpha_composite(outline, (12, 12))
    part.alpha_composite(cutout, (12, 12))
    return part


def add_vn_finish(image: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, image.width, image.height), outline=(255, 255, 255, 90), width=12)
    draw.rectangle((28, 28, image.width - 28, image.height - 28), outline=(255, 255, 255, 58), width=2)
    draw.rectangle((0, 0, image.width, 190), fill=(255, 255, 255, 26))
    draw.rectangle((0, image.height - 250, image.width, image.height), fill=(13, 25, 48, 64))
    return Image.alpha_composite(image, overlay)


def add_dialogue(image: Image.Image) -> Image.Image:
    result = image.copy()
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    box = (120, 795, 1800, 1010)
    draw.rounded_rectangle(box, radius=28, fill=(19, 31, 58, 210), outline=(255, 255, 255, 220), width=3)
    draw.rounded_rectangle((150, 748, 510, 825), radius=24, fill=(111, 169, 193, 235), outline=(255, 255, 255, 230), width=3)
    draw.text((188, 770), "田中 雅虎", font=load_font(34, True), fill=(255, 255, 255, 255))
    draw.text((174, 844), "夏の海、祭りの熱、そして全員集合。", font=load_font(36, True), fill=(255, 255, 255, 255))
    draw.text((174, 902), "ここから始まるのは、ちょっと騒がしいポートフォリオの一幕。", font=load_font(30), fill=(230, 246, 255, 245))
    return Image.alpha_composite(result, overlay)


def add_main_visual_finish(image: Image.Image) -> Image.Image:
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.rectangle((0, 0, image.width, image.height), fill=(255, 255, 255, 18))
    draw.ellipse((-260, -220, 860, 650), fill=(255, 250, 213, 64))
    draw.ellipse((1100, -120, 2160, 760), fill=(159, 219, 244, 46))
    draw.polygon([(0, 930), (1920, 810), (1920, 1080), (0, 1080)], fill=(222, 248, 236, 118))
    for offset, alpha in [(0, 90), (22, 55), (46, 34)]:
        draw.arc((-220 + offset, 770 + offset, 860 + offset, 1280 + offset), 185, 354, fill=(255, 255, 255, alpha), width=4)
    return Image.alpha_composite(image, overlay)


def add_title_mark(image: Image.Image) -> Image.Image:
    result = image.copy()
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    title_font = load_font(92, True)
    sub_font = load_font(25)
    small_font = load_font(21, True)
    draw.text((96, 92), "STELLA", font=title_font, fill=(22, 34, 58, 236))
    draw.text((96, 178), "PORTFOLIO", font=title_font, fill=(22, 34, 58, 236))
    draw.text((104, 286), "Game Programmer / Team Entertainer", font=sub_font, fill=(43, 97, 126, 220))
    draw.rounded_rectangle((96, 340, 390, 392), radius=26, fill=(255, 255, 255, 178), outline=(255, 255, 255, 230), width=2)
    draw.text((125, 352), "TANAKA MASATORA", font=small_font, fill=(43, 97, 126, 235))
    return Image.alpha_composite(result, overlay)


def draw_centered_text(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], text: str, font: ImageFont.FreeTypeFont, fill: tuple[int, int, int, int]) -> None:
    text_box = draw.textbbox((0, 0), text, font=font)
    text_width = text_box[2] - text_box[0]
    text_height = text_box[3] - text_box[1]
    x = box[0] + (box[2] - box[0] - text_width) // 2
    y = box[1] + (box[3] - box[1] - text_height) // 2
    draw.text((x, y), text, font=font, fill=fill)


def add_motto_panel(image: Image.Image) -> Image.Image:
    result = image.copy()
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    panel = (410, 300, 1510, 520)
    draw.rounded_rectangle(panel, radius=34, fill=(255, 255, 255, 208), outline=(255, 255, 255, 246), width=3)
    draw.rounded_rectangle((panel[0] + 20, panel[1] + 20, panel[2] - 20, panel[3] - 20), radius=24, outline=(104, 173, 205, 176), width=2)
    draw.line((panel[0] + 92, panel[1] + 164, panel[2] - 92, panel[1] + 164), fill=(104, 173, 205, 150), width=2)
    draw_centered_text(draw, (panel[0], panel[1] + 48, panel[2], panel[1] + 128), "すべてを楽しむからこそ、より楽しい体験を創る。", load_font(38, True), (20, 34, 58, 244))
    draw_centered_text(draw, (panel[0], panel[1] + 146, panel[2], panel[1] + 194), "Masatora's Portfolio", load_font(27, True), (42, 98, 129, 230))
    return Image.alpha_composite(result, overlay)


def add_waiwai_finish(image: Image.Image) -> Image.Image:
    result = add_main_visual_finish(image)
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    # 中央の文字へ視線が戻るよう、人物の外側へ軽い演出を足す。
    for box, color in [
        ((-160, 110, 560, 830), (255, 255, 255, 42)),
        ((1370, 70, 2100, 860), (113, 193, 230, 38)),
        ((520, 730, 1400, 1220), (255, 250, 226, 46)),
    ]:
        draw.ellipse(box, fill=color)
    return Image.alpha_composite(result, overlay)


def save_waiwai_parts() -> None:
    HERO_PARTS_DIR.mkdir(parents=True, exist_ok=True)
    for name, path, height, _x, _y, angle in WAIWAI_MAIN_CUTOUTS:
        build_cutout_part(path, height, angle).save(HERO_PARTS_DIR / f"{name}.png")


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    background = Image.open(BACKGROUND).convert("RGB")
    canvas = grade_background(cover_crop(background, CANVAS, y_bias=0.24))

    for item in CUTOUTS:
        add_cutout(canvas, *item)

    clean = add_vn_finish(canvas)
    clean.save(OUT_DIR / "novel-still-matsuri.png")
    add_dialogue(clean).save(OUT_DIR / "novel-still-matsuri-dialogue.png")

    main_visual = grade_background(cover_crop(background, CANVAS, y_bias=0.14))
    main_visual = add_main_visual_finish(main_visual)
    for item in MAIN_VISUAL_CUTOUTS:
        add_cutout(main_visual, *item)
    main_visual.save(OUT_DIR / "portfolio-main-visual.png")
    add_title_mark(main_visual).save(OUT_DIR / "portfolio-main-visual-title.png")

    waiwai_visual = grade_background(cover_crop(background, CANVAS, y_bias=0.14))
    waiwai_visual = add_waiwai_finish(waiwai_visual)
    waiwai_visual.save(OUT_DIR / "portfolio-main-visual-bg.png")
    waiwai_visual = add_motto_panel(waiwai_visual)
    for _name, path, height, x, y, angle in WAIWAI_MAIN_CUTOUTS:
        add_cutout(waiwai_visual, path, height, x, y, angle)
    waiwai_visual.save(OUT_DIR / "portfolio-main-visual-waiwai.png")
    save_waiwai_parts()


if __name__ == "__main__":
    main()
