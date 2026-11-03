#!/usr/bin/env python3
"""Render the generated backdrops into the site's register.

The source images are made by an image model and are beautiful on their own
terms: bright, saturated, high-contrast. None of that is what a background
layer behind body copy wants. This script is the one place that treatment
happens, so the rule is legible instead of being spread across a CSS filter, an
ffmpeg pass and an export step that each darken a little more.

The rule, in order:

  1. **Duotone.** Every image is reduced to luminance and re-coloured from the
     site's own two anchors — `ink-950` for the shadows, a cool blue for the
     highlights. This is what makes eight separate generations read as one
     family, and it is why the result cannot drift off-palette no matter what
     the model returns.
  2. **A measured exposure**, applied last and measured in the same space it is
     applied in: the mean luminance is brought into a narrow band
     (TARGET_MEAN) and the brightest 0.5% of pixels are capped (TARGET_PEAK).
     Text sitting on the layer keeps its contrast because the layer is
     guaranteed to be dark, not merely dark-ish.
  3. **Edge falloff.** A soft vignette so the layer dissolves into the section
     instead of ending at a hard rectangle.

Nothing here is a stylistic opinion applied per image; it is the same pipeline
for all of them, which is the point.

Usage:
    python3 scripts/process-backdrops.py [name ...]     # default: all
"""

from __future__ import annotations

import pathlib
import sys

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

RAW_DIR = pathlib.Path.home() / ".qra-raw" / "v2"
OUT_DIR = pathlib.Path("public/images")

# The two anchors the duotone interpolates between: the page's darkest ink, and
# a highlight that is a lightened brand blue rather than white — a neutral white
# highlight is what makes generated art look like stock.
SHADOW = (7, 10, 15)
HIGHLIGHT = (126, 165, 255)

# Delivery width. Backdrops are always cover-fit and often scrolled past at
# speed, so 1920 is generous.
WIDTH = 1920

# The measured exposure targets, as 0–255 luminance of the FINAL image — after
# the duotone and the vignette, which is also where they are measured.
TARGET_MEAN = 17.0
TARGET_PEAK = 58.0

# How far the vignette falls at the frame's edge.
VIGNETTE_DARKEN = 0.55

IMAGES = {
    "hero": "ai-hero.webp",
    "problem": "ai-problem.webp",
    "idea": "ai-idea.webp",
    "product": "ai-product.webp",
    "investors": "ai-investor.webp",
    "trust": "ai-trust.webp",
    "about": "ai-about.webp",
    "waitlist": "ai-waitlist.webp",
}


def _duotone_lut(lum: Image.Image) -> Image.Image:
    """Map luminance onto the shadow→highlight ramp, via three channel LUTs."""
    lut = []
    for value in range(256):
        t = value / 255
        # A slight gamma keeps the mid-tones from washing out the shadows.
        t = t**1.15
        lut.append(
            tuple(round(SHADOW[c] + (HIGHLIGHT[c] - SHADOW[c]) * t) for c in range(3))
        )
    return _apply(lum, lut)


def _apply(lum: Image.Image, lut: list[tuple[int, int, int]]) -> Image.Image:
    """Apply the ramp through one LUT per channel."""
    return Image.merge(
        "RGB",
        [
            lum.point([c[0] for c in lut]),
            lum.point([c[1] for c in lut]),
            lum.point([c[2] for c in lut]),
        ],
    )


def _luminance(img: Image.Image) -> Image.Image:
    return img.convert("L")


def exposure(img: Image.Image) -> Image.Image:
    """Place the finished image in the exposure band, in one closed form.

    Two constraints — the mean lands on TARGET_MEAN and the brightest 0.5% of
    pixels land on TARGET_PEAK — and two free parameters in a per-channel
    affine map `out = a·in + b`. Solving them together beats nudging gain and
    clip in sequence, which drives one target off whenever it fixes the other.
    Hue is untouched: the same `a` and `b` go to all three channels.
    """
    lum = _luminance(img)
    mean = mean_of(lum)
    peak = percentile(lum, 0.995)

    if peak <= mean:
        # A flat frame: nothing to shape. Just set the level.
        return img.point(lambda v: min(255, round(v * (TARGET_MEAN / max(mean, 1.0)))))

    a = (TARGET_PEAK - TARGET_MEAN) / (peak - mean)
    b = TARGET_MEAN - a * mean
    return img.point(lambda v: max(0, min(255, round(a * v + b))))


def percentile(lum: Image.Image, fraction: float) -> float:
    histogram = lum.histogram()
    total = sum(histogram)
    target = total * fraction
    seen = 0
    for value, count in enumerate(histogram):
        seen += count
        if seen >= target:
            return float(value)
    return 255.0


def vignette(img: Image.Image, darken: float = VIGNETTE_DARKEN) -> Image.Image:
    """Fall the edges into the page's own ink so the layer has no boundary."""
    w, h = img.size
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).ellipse([-w * 0.18, -h * 0.38, w * 1.18, h * 1.38], fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(w * 0.13))
    dark = Image.new("RGB", (w, h), SHADOW)
    return Image.composite(img, Image.blend(img, dark, darken), mask)


def process(name: str, target: str) -> str:
    source = Image.open(RAW_DIR / f"{name}.png").convert("RGB")
    if source.width > WIDTH:
        source = source.resize(
            (WIDTH, round(source.height * WIDTH / source.width)), Image.LANCZOS
        )

    # Flatten the model's own saturation before measuring: the duotone decides
    # colour, this only decides how much texture survives.
    lum = ImageOps.grayscale(source)
    lum = ImageEnhance.Contrast(lum).enhance(0.92)
    img = vignette(_duotone_lut(lum))
    img = exposure(img)

    out = OUT_DIR / target
    img.save(out, "WEBP", quality=82, method=6)

    check = img.convert("L")
    return (
        f"  {target:22} {img.width}x{img.height} "
        f"{(out.stat().st_size / 1024):5.1f}kB  "
        f"mean={mean_of(check):5.1f}  p99.5={percentile(check, 0.995):5.0f}"
    )


def mean_of(lum: Image.Image) -> float:
    histogram = lum.histogram()
    total = sum(histogram)
    return sum(i * count for i, count in enumerate(histogram)) / total


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    names = sys.argv[1:] or list(IMAGES)
    unknown = [n for n in names if n not in IMAGES]
    if unknown:
        print(f"unknown: {', '.join(unknown)}")
        return 1
    for name in names:
        print(process(name, IMAGES[name]))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
