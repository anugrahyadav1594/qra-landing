#!/usr/bin/env python3
"""Render the site's pre-rendered motion assets.

Everything the page used to compute in JavaScript lives here instead: short,
seamless, heavily-compressed loops built from the atmospheric stills, plus the
posters that stand in for them under reduced motion or on a slow connection.

Why this exists
---------------
A canvas field that animates forever costs main-thread time on every device.
A 10-second loop that the GPU plays costs effectively nothing, looks the same
to the eye, and cannot drop a frame while the user is scrolling.

What it produces (into frontend/public/motion/)
-----------------------------------------------
  <name>.webm          VP9 — the primary source (excellent on dark gradients)
  <name>.mp4           H.264 — the fallback for older Safari
  <name>-poster.webp   the first frame, used before playback and as the
                       reduced-motion / slow-connection replacement

How the loops are made seamless
-------------------------------
Each clip is rendered forwards, then concatenated with a reversed copy of
itself, so the last frame equals the first. The HTML `<video loop>` therefore
restarts without a visible cut.

Usage
-----
    python3 scripts/render-motion.py            # all assets
    python3 scripts/render-motion.py hero       # just one

Requires a static ffmpeg: `pip install --break-system-packages imageio-ffmpeg`.
"""

from __future__ import annotations

import pathlib
import subprocess
import sys

import imageio_ffmpeg

ROOT = pathlib.Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "images"
OUT = ROOT / "public" / "motion"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# Rendering parameters. 720p at 24fps is plenty for a blurred, slowly moving
# backdrop, and keeps each loop well under a megabyte.
WIDTH, HEIGHT, FPS = 960, 540, 24


def render_loop(
    source: str,
    name: str,
    seconds: float = 5.0,
    zoom: float = 0.05,
    pan: int = 26,
    brightness: float = 0.62,
    saturation: float = 0.5,
) -> None:
    """One seamless loop from one still."""
    frames = int(seconds * FPS)
    src = SOURCE / source

    # The still is scaled up first so the crop has room to travel, then zoompan
    # supplies the movement: a slow push in, with a lateral drift that gives the
    # image a sense of depth rather than a pan.
    # The still is scaled to a little over the output size, then zoompan moves
    # the crop across it. Working at 1.3x rather than 2x keeps the render inside
    # a modest memory budget — the output is a soft backdrop, so it loses
    # nothing, and the encoder no longer risks being killed on a small machine.
    movement = (
        f"scale={int(WIDTH * 1.3)}:-2,"
        f"zoompan="
        f"z='1+{zoom}*on/{frames}':"
        f"x='iw/2-(iw/zoom/2)+sin(on/{frames / 2}*PI)*{pan}':"
        f"y='ih/2-(ih/zoom/2)-cos(on/{frames / 2}*PI)*{pan / 2}':"
        # d=1: one output frame per input frame. The bounded input supplies the
        # frame count, and `on` still counts output frames, so the expressions
        # above work exactly as written.
        f"d=1:s={WIDTH}x{HEIGHT}:fps={FPS}"
    )

    treatment = (
        # Desaturate and darken: this is a backdrop, never a picture. The
        # mapping is centred so the named parameters read as "how dark"
        # (0.72 = neutral), and the vignette pulls the edges down further.
        f"eq=brightness={brightness - 0.72:.2f}:saturation={saturation}:contrast=1.02,"
        # A gentle vignette pulls the eye to the centre of the composition.
        "vignette=angle=PI/4:mode=forward,"
        # Debanding for cheap panels is handled by the poster's grain and the
        # wash above the video — not by per-frame noise, which would defeat
        # temporal compression and multiply the encode time.
        "format=yuv420p"
    )

    # Forwards then backwards: the seam disappears. (Each chain is separated
    # explicitly — a filtergraph will not infer the boundary.)
    loop = "[treated]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1:a=0[out]"

    base = [
        FFMPEG,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        # A bounded still source. `-loop 1` alone is an infinite stream, and
        # `reverse` upstream of it would buffer forever.
        "-loop",
        "1",
        "-t",
        f"{seconds:g}",
        "-r",
        str(FPS),
        "-i",
        str(src),
        "-filter_complex",
        f"[0:v]{movement},{treatment}[treated];{loop}",
        "-map",
        "[out]",
    ]

    OUT.mkdir(parents=True, exist_ok=True)

    # VP9: the primary. Slow, patient encode settings are fine — this runs once.
    subprocess.run(
        base
        + [
            "-c:v", "libvpx-vp9",
            "-crf", "40",
            "-b:v", "0",
            "-row-mt", "1",
            "-deadline", "realtime",
            "-cpu-used", "8",
            "-threads", "4",
            "-pix_fmt", "yuv420p",
            "-an",
            str(OUT / f"{name}.webm"),
        ],
        check=True,
    )

    # H.264: the fallback.
    subprocess.run(
        base
        + [
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "30",
            "-profile:v", "high",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-an",
            str(OUT / f"{name}.mp4"),
        ],
        check=True,
    )

    # Poster: the same first frame, as WebP, for the pre-playback state.
    subprocess.run(
        [
            FFMPEG,
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(OUT / f"{name}.webm"),
            "-frames:v",
            "1",
            "-c:v",
            "libwebp",
            "-quality",
            "72",
            str(OUT / f"{name}-poster.webp"),
        ],
        check=True,
    )

    sizes = ", ".join(
        f"{p.name} {p.stat().st_size // 1024}kB"
        for p in sorted(OUT.glob(f"{name}*"))
    )
    print(f"  {name}: {sizes}")


ASSETS: dict[str, dict] = {
    # The hero's information space: streaks resolving into ordered lines.
    # Brightness is baked, not applied in CSS: a filter over a playing video
    # is a per-frame GPU pass, and the value is a constant anyway.
    "hero": dict(source="qra-hero.webp", seconds=4.0, zoom=0.05, pan=22, brightness=0.62),
    # The final CTA: light converging on one line, barely moving.
    "waitlist": dict(source="qra-clarity.webp", seconds=4.0, zoom=0.04, pan=18, brightness=0.7),
}


def main() -> None:
    wanted = sys.argv[1:] or list(ASSETS)
    unknown = [name for name in wanted if name not in ASSETS]
    if unknown:
        raise SystemExit(f"unknown asset(s): {', '.join(unknown)} (have: {', '.join(ASSETS)})")

    print(f"rendering into {OUT.relative_to(ROOT)} with {pathlib.Path(FFMPEG).name}")
    for name in wanted:
        render_loop(name=name, **ASSETS[name])
    total = sum(p.stat().st_size for p in OUT.glob("*")) // 1024
    print(f"total motion payload: {total}kB")


if __name__ == "__main__":
    main()
