#!/usr/bin/env python3
"""
PRE-RENDERED GRAPHICS for the three signature sections.

Everything here is drawn frame by frame and encoded, rather than generated in
the browser at runtime. Three pieces:

  problem-flood   information arriving from everywhere at once and piling up
                  until it stops being readable — the problem section's subject
  idea-flow       the same information travelling through a route: scattered,
                  then aligned, then structured — the idea section's subject
  (the investor paths are hand-authored SVG, in public/graphics/)

Both loops are *parametrically periodic*: every element's position is a function
of `(cycle * t + phase) mod 1` with an integer cycle count, so the state at t=1
is exactly the state at t=0. The loop joins without a seam and without the
forward/reverse trick, which is what lets the motion read as continuous flow
rather than a breath.

    python3 scripts/render-graphics.py            # everything
    python3 scripts/render-graphics.py flood      # one piece
"""

import math
import os
import random
import subprocess
import sys
import tempfile
import time
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageChops, ImageDraw, ImageFilter

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
OUT = Path(__file__).resolve().parent.parent / "public" / "motion"

# Default frame size. Pieces that are shown in a wide band declare their own, so
# the frame is composed for the space it actually appears in rather than cropped
# into it.
WIDTH, HEIGHT = 960, 540
FPS = 24
SECONDS = 6
FRAMES = FPS * SECONDS

# The site's palette, in the renderer's terms.
INK = (7, 10, 15)
INK_RAISED = (13, 19, 29)
PAPER = (245, 247, 250)
BRAND = (63, 111, 255)
BRAND_LIGHT = (111, 148, 255)


# ── drawing helpers ───────────────────────────────────────────────────────


def mix(a, b, amount):
    """Blend two colours. `amount` 0 = a, 1 = b."""
    return tuple(round(a[i] + (b[i] - a[i]) * amount) for i in range(3))


def rgba(colour, alpha):
    return (*colour, max(0, min(255, int(alpha))))


def canvas(width=WIDTH, height=HEIGHT):
    """A frame, with a soft vertical gradient and a vignette already in place."""
    image = Image.new("RGB", (width, height), INK)
    draw = ImageDraw.Draw(image)
    for y in range(height):
        # Slightly raised through the middle, so the composition has a centre.
        depth = math.sin(math.pi * (y / height)) ** 1.4
        draw.line([(0, y), (width, y)], fill=mix(INK, INK_RAISED, 0.75 * depth))
    return image


def vignette(image, strength=0.85):
    width, height = image.size
    mask = Image.new("L", (width, height), 0)
    ImageDraw.Draw(mask).ellipse(
        [-width * 0.18, -height * 0.42, width * 1.18, height * 1.42], fill=255
    )
    mask = mask.filter(ImageFilter.GaussianBlur(width * 0.14))
    dark = Image.new("RGB", (width, height), (2, 4, 7))
    return Image.composite(image, Image.blend(image, dark, strength), mask)


def glow(layer, radius, gain=1.0):
    """A blurred copy of a layer, added back to it — cheap bloom."""
    bloom = layer.filter(ImageFilter.GaussianBlur(radius))
    if gain != 1.0:
        bloom = bloom.point(lambda v: min(255, int(v * gain)))
    return ImageChops.add(layer, bloom)


# ── PROBLEM: the flood ────────────────────────────────────────────────────


def build_flood():
    """
    Information arriving from everywhere.

    Three depth layers of document fragments, each drifting on its own slow
    integer-cycle orbit, over faint filaments and a handful of lit nodes. Density
    is deliberately high: the point of the picture is that it is too much.
    """
    rng = random.Random(20261003)
    WIDTH, HEIGHT = 960, 540

    layers = [
        # count, size range, alpha, blur, speed, lines
        (58, (26, 16, 58, 38), 30, 2.2, 1, False),
        (36, (40, 26, 86, 56), 54, 0.9, 2, True),
        (18, (58, 38, 122, 78), 82, 0.0, 1, True),
    ]

    # Fragments are grouped by depth: one blur per layer instead of one per
    # fragment, which is the difference between 90 blurs a frame and three.
    docs = []
    for depth, (count, (min_w, min_h, max_w, max_h), alpha, blur, speed, lines) in enumerate(layers):
        for _ in range(count):
            w = rng.uniform(min_w, max_w)
            h = rng.uniform(min_h, max_h)
            docs.append(
                {
                    "depth": depth,
                    "x": rng.uniform(-40, WIDTH + 40),
                    "y": rng.uniform(-30, HEIGHT + 30),
                    "w": w,
                    "h": h,
                    "alpha": alpha * rng.uniform(0.7, 1.15),
                    "blur": blur,
                    "speed": speed,
                    "phase": rng.random(),
                    "drift_x": rng.uniform(-26, 26),
                    "drift_y": rng.uniform(-16, 16),
                    "tilt": rng.uniform(-0.5, 0.5),
                    "lines": lines,
                    "line_count": rng.randint(2, 4) if lines else 0,
                }
            )
    layer_docs = [[d for d in docs if d["depth"] == depth] for depth in range(len(layers))]

    nodes = [
        {
            "x": rng.uniform(60, WIDTH - 60),
            "y": rng.uniform(50, HEIGHT - 50),
            "r": rng.uniform(1.4, 2.6),
            "phase": rng.random(),
            "speed": rng.choice([1, 2]),
        }
        for _ in range(14)
    ]

    for frame in range(FRAMES):
        t = frame / FRAMES
        base = canvas()
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # Filaments first, so the fragments sit on top of the web.
        for index in range(0, len(nodes) - 1):
            a, b = nodes[index], nodes[index + 1]
            ax = a["x"] + math.sin(2 * math.pi * (a["speed"] * t + a["phase"])) * 18
            ay = a["y"] + math.cos(2 * math.pi * (a["speed"] * t + a["phase"])) * 12
            bx = b["x"] + math.sin(2 * math.pi * (b["speed"] * t + b["phase"])) * 18
            by = b["y"] + math.cos(2 * math.pi * (b["speed"] * t + b["phase"])) * 12
            if math.dist((ax, ay), (bx, by)) < 210:
                draw.line([(ax, ay), (bx, by)], fill=rgba(BRAND_LIGHT, 26), width=1)

        # One pass per depth layer, far to near: depth before sharpness.
        for depth, group in enumerate(layer_docs):
            layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
            draw_layer = ImageDraw.Draw(layer)
            for doc in group:
                phase = doc["speed"] * t + doc["phase"]
                x = doc["x"] + math.sin(2 * math.pi * phase) * doc["drift_x"]
                y = doc["y"] + math.cos(2 * math.pi * phase) * doc["drift_y"]
                w, h = doc["w"], doc["h"]
                box = [x - w / 2, y - h / 2, x + w / 2, y + h / 2]

                draw_layer.rounded_rectangle(
                    box, radius=3, fill=rgba(mix(INK_RAISED, PAPER, 0.06), doc["alpha"] * 0.9)
                )
                draw_layer.rounded_rectangle(
                    box, radius=3, outline=rgba(PAPER, doc["alpha"] * 0.5), width=1
                )
                if doc["lines"]:
                    for line in range(doc["line_count"]):
                        ly = box[1] + 11 + line * 7
                        lw = (w - 16) * (0.45 + 0.5 * ((line * 7 + int(doc["x"])) % 10) / 10)
                        draw_layer.rounded_rectangle(
                            [box[0] + 8, ly, box[0] + 8 + lw, ly + 2.5],
                            radius=2,
                            fill=rgba(PAPER, doc["alpha"] * 0.42),
                        )
            if group[0]["blur"]:
                layer = layer.filter(ImageFilter.GaussianBlur(group[0]["blur"]))
            overlay = Image.alpha_composite(overlay, layer)

        # The lit nodes: the few things bright enough to find in the pile.
        for node in nodes:
            phase = node["speed"] * t + node["phase"]
            x = node["x"] + math.sin(2 * math.pi * phase) * 18
            y = node["y"] + math.cos(2 * math.pi * phase) * 12
            halo = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
            hdraw = ImageDraw.Draw(halo)
            hdraw.ellipse(
                [x - 16, y - 16, x + 16, y + 16], fill=rgba(BRAND, 34)
            )
            halo = halo.filter(ImageFilter.GaussianBlur(8))
            overlay = Image.alpha_composite(overlay, halo)
            ImageDraw.Draw(overlay).ellipse(
                [x - node["r"], y - node["r"], x + node["r"], y + node["r"]],
                fill=rgba(BRAND_LIGHT, 210),
            )

        composed = Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")
        composed = glow(composed, 6, 0.35)
        yield vignette(composed)


# ── IDEA: the route ───────────────────────────────────────────────────────


def build_flow():
    """
    The same information, organised.

    Composed for a wide band — 1440×420, so it fills the window it is shown in
    instead of being cropped into it — and stated in three zones the eye can
    read without a caption:

      left    sources, as a stack of marks with particles arriving among them
      middle  a funnel: the particles converge, and the frame narrows to a waist
      right   rows: the same particles running along ruled lanes

    The convergence is a function of horizontal position, so the picture makes
    the argument rather than decorating it. Every particle is a function of
    (whole cycles × t + phase) mod 1, which is what makes the loop seamless.
    """
    rng = random.Random(889912)
    WIDTH, HEIGHT = 1440, 420

    ROWS = 5
    row_step = HEIGHT / (ROWS + 0.9)
    rows = [row_step * (index + 1) for index in range(ROWS)]

    # The zones: sources, the funnel, the lanes.
    sources_end = WIDTH * 0.28
    waist_start = WIDTH * 0.60

    particles = [
        {
            "phase": rng.random(),
            # 1 or 2 whole passes per loop: the only speeds that make it exact.
            "speed": rng.choice([1, 2]),
            "scatter_y": rng.uniform(28, HEIGHT - 28),
            "row": rng.randrange(ROWS),
            "jitter": rng.uniform(-5, 5),
            "size": rng.uniform(1.0, 2.1),
            "bright": rng.random() < 0.26,
        }
        for _ in range(260)
    ]

    # The source wall: documents the particles come out of.
    wall = [
        {
            "x": rng.uniform(16, sources_end - 40),
            "y": rng.uniform(26, HEIGHT - 26),
            "w": rng.uniform(26, 52),
            "h": rng.uniform(14, 22),
            "phase": rng.random(),
        }
        for _ in range(30)
    ]

    def ease_out(value):
        return 1 - (1 - value) ** 3

    for frame in range(FRAMES):
        t = frame / FRAMES
        base = canvas(WIDTH, HEIGHT)
        overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        draw = ImageDraw.Draw(overlay)

        # ── zone one: the sources ──
        for doc in wall:
            wobble = math.sin(2 * math.pi * (t + doc["phase"])) * 2.5
            box = [doc["x"], doc["y"] + wobble, doc["x"] + doc["w"], doc["y"] + wobble + doc["h"]]
            draw.rounded_rectangle(box, radius=2, outline=rgba(PAPER, 46), width=1)
            for line in range(2):
                ly = box[1] + 4 + line * 5
                draw.line(
                    [(box[0] + 4, ly), (box[0] + 4 + doc["w"] * 0.55, ly)],
                    fill=rgba(PAPER, 30),
                    width=1,
                )

        # ── the funnel: two converging rails, meeting at the waist ──
        waist = HEIGHT / 2
        # The gate: where the frame organises. Drawn into the same surface as
        # everything else — compositing a new image here would leave `draw`
        # pointing at the discarded one.
        for ring, alpha in ((26, 46), (40, 22)):
            draw.ellipse(
                [waist_start - ring, waist - ring, waist_start + ring, waist + ring],
                outline=rgba(BRAND_LIGHT, alpha),
                width=1,
            )

        for side in (-1, 1):
            draw.line(
                [
                    (sources_end, waist + side * (HEIGHT * 0.44)),
                    (waist_start, waist + side * 12),
                ],
                fill=rgba(BRAND_LIGHT, 30),
                width=1,
            )
            draw.line(
                [
                    (waist_start, waist + side * 12),
                    (WIDTH - 20, rows[0] + side * (rows[-1] - rows[0]) * 0.5),
                ],
                fill=rgba(BRAND_LIGHT, 22),
                width=1,
            )

        # ── zone three: the lanes ──
        for y in rows:
            draw.line([(waist_start, y), (WIDTH - 16, y)], fill=rgba(PAPER, 40), width=1)
            for tick in range(1, 9):
                tx = waist_start + tick * ((WIDTH - 16 - waist_start) / 9)
                draw.line([(tx, y - 5), (tx, y + 5)], fill=rgba(PAPER, 20), width=1)

        # ── the particles ──
        for particle in particles:
            u = (particle["speed"] * t + particle["phase"]) % 1.0
            x = u * (WIDTH + 80) - 40

            if x <= sources_end:
                y = particle["scatter_y"]
            elif x <= waist_start:
                progress = ease_out((x - sources_end) / (waist_start - sources_end))
                y = particle["scatter_y"] + (waist - particle["scatter_y"]) * progress
            else:
                # Out of the waist and into its lane.
                lanes = rows[particle["row"]]
                progress = min(1.0, (x - waist_start) / (WIDTH * 0.12))
                y = waist + (lanes - waist) * ease_out(progress) + particle["jitter"] * progress

            # Fade in at the left edge, out at the right: nothing ever pops.
            if u < 0.07:
                alpha = u / 0.07
            elif u > 0.93:
                alpha = (1 - u) / 0.07
            else:
                alpha = 1.0

            colour = BRAND_LIGHT if particle["bright"] else PAPER
            strength = (165 if particle["bright"] else 88) * alpha
            radius = particle["size"] + (1.3 if particle["bright"] else 0)
            draw.ellipse(
                [x - radius, y - radius, x + radius, y + radius],
                fill=rgba(colour, strength),
            )
            if particle["bright"]:
                draw.line(
                    [(x - 26, y), (x - radius, y)],
                    fill=rgba(colour, strength * 0.3),
                    width=1,
                )

        composed = Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")
        composed = glow(composed, 5, 0.4)
        yield vignette(composed, 0.55)


# ── encoding ──────────────────────────────────────────────────────────────


def encode(name, frames, poster_at=0.5, crf=40):
    """
    Write one piece: VP9 WebM (primary), H.264 MP4 (fallback) and a WebP poster.

    Frames are streamed straight into ffmpeg's stdin — 144 960×540 images is a
    lot of disk to write for no reason.
    """
    OUT.mkdir(parents=True, exist_ok=True)
    started = time.time()
    poster_frame = int(FRAMES * poster_at)
    poster_written = False

    # The two encodes share one generation of frames.
    with tempfile.TemporaryDirectory() as tmp:
        seq = Path(tmp)
        for index, frame in enumerate(frames):
            frame.save(seq / f"{index:04d}.png", "PNG", compress_level=1)
            if index == poster_frame:
                frame.save(OUT / f"{name}-poster.webp", "WEBP", quality=80, method=4)
                poster_written = True

        for codec, suffix, args in (
            (
                "vp9",
                "webm",
                [
                    "-c:v", "libvpx-vp9", "-crf", str(crf), "-b:v", "0",
                    "-row-mt", "1", "-deadline", "realtime", "-cpu-used", "8",
                    "-tile-columns", "2", "-threads", "2", "-pix_fmt", "yuv420p", "-an",
                ],
            ),
            (
                "x264",
                "mp4",
                [
                    "-c:v", "libx264", "-preset", "veryfast",
                    "-crf", str(min(40, crf - 8)),
                    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an",
                ],
            ),
        ):
            target = OUT / f"{name}.{suffix}"
            result = subprocess.run(
                [
                    FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
                    "-framerate", str(FPS), "-i", str(seq / "%04d.png"),
                    *args, str(target),
                ],
                capture_output=True,
                text=True,
            )
            if result.returncode != 0:
                raise SystemExit(f"{codec} failed: {result.stderr[-400:]}")

    sizes = {
        suffix: (OUT / f"{name}.{suffix}").stat().st_size
        for suffix in ("webm", "mp4")
    }
    poster_size = (OUT / f"{name}-poster.webp").stat().st_size
    print(
        f"  {name}: poster {poster_size // 1024}kB, "
        f"webm {sizes['webm'] // 1024}kB, mp4 {sizes['mp4'] // 1024}kB "
        f"({time.time() - started:.0f}s, poster={poster_written})"
    )


def build_mesh():
    """The investors backdrop: arcs meeting a horizon."""
    """
    The investors backdrop: a field of arcs meeting at a horizon.

    Rendered as a single still rather than a loop — this section is about three
    readers, and a moving background would compete with the paths drawn on top
    of it.
    """
    rng = random.Random(4242)
    WIDTH, HEIGHT = 960, 540
    base = canvas(WIDTH, HEIGHT)

    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    horizon = HEIGHT * 0.62
    # Arcs rising from the horizon: each one a different distance, so the field
    # reads as depth rather than as a pattern.
    for index in range(52):
        # Narrow and tall rather than wide: a canopy, not a scribble.
        spread = 54 + (index % 7) * 30
        height = 46 + ((index * 13) % 11) * 26
        cx = WIDTH * (0.06 + 0.88 * (index % 6) / 5)
        draw.arc(
            [cx - spread, horizon - height * 2.1, cx + spread, horizon + height * 0.4],
            start=202,
            end=338,
            fill=rgba(BRAND_LIGHT, 14 + (index % 4) * 5),
            width=1,
        )

    # Beams: near-vertical lines converging toward the horizon.
    for index in range(24):
        x = 30 + index * 40
        lean = (x - WIDTH / 2) * 0.16
        draw.line(
            [(x, HEIGHT + 20), (x + lean, horizon)],
            fill=rgba(PAPER, 12 + (index % 3) * 5),
            width=1,
        )

    # The floor: faint horizontal lines behind the beams.
    for index in range(9):
        y = horizon + 26 + index * 34
        if y < HEIGHT:
            draw.line([(0, y), (WIDTH, y)], fill=rgba(PAPER, 9), width=1)

    # Nodes where the arcs cross the horizon.
    for index in range(11):
        x = 60 + index * 84 + rng.uniform(-10, 10)
        r = rng.uniform(1.4, 2.6)
        glow_patch = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
        ImageDraw.Draw(glow_patch).ellipse(
            [x - 14, horizon - 14, x + 14, horizon + 14], fill=rgba(BRAND, 40)
        )
        overlay = Image.alpha_composite(overlay, glow_patch.filter(ImageFilter.GaussianBlur(7)))
        draw.ellipse([x - r, horizon - r, x + r, horizon + r], fill=rgba(BRAND_LIGHT, 200))

    composed = Image.alpha_composite(base.convert("RGBA"), overlay).convert("RGB")
    composed = glow(composed, 7, 0.4)
    return vignette(composed, 0.6)


PIECES = {"flood": build_flood, "flow": build_flow}


def main():
    # The mesh is a still, not an encoded loop, so it is not in PIECES.
    wanted = sys.argv[1:] or [*PIECES, "mesh"]

    if "mesh" in wanted:
        OUT.mkdir(parents=True, exist_ok=True)
        target = OUT / "investors-mesh.webp"
        build_mesh().save(target, "WEBP", quality=82, method=4)
        print(f"  mesh: {target.name} {target.stat().st_size // 1024}kB")
        wanted = [w for w in wanted if w != "mesh"]
        if not wanted:
            return
    print(f"rendering into {OUT} with {Path(FFMPEG).name}")
    for name in wanted:
        builder = PIECES.get(name)
        if builder is None:
            raise SystemExit(f"unknown piece: {name} (have {', '.join(PIECES)})")
        # The flow is busier and more compressible by eye, not by bits.
        encode(
            {"flood": "problem-flood", "flow": "idea-flow"}[name],
            builder(),
            crf={"flood": 40, "flow": 46}[name],
        )
    total = sum(f.stat().st_size for f in OUT.glob("*"))
    print(f"motion payload: {total // 1024}kB")


if __name__ == "__main__":
    os.environ.setdefault("PYTHONHASHSEED", "0")
    main()
