#!/usr/bin/env python3
"""
PRE-RENDERED SVG GRAPHICS.

The diagrams for the idea and investor sections, generated as standalone `.svg`
files and loaded with a plain `<img>`. That matters for three reasons:

  · the geometry is fixed, so it is authored once here rather than rebuilt in
    React on every render;
  · the animation lives *inside* the file as CSS. An SVG loaded as an image gets
    its own rendering context — the browser animates it without involving the
    page's JavaScript, the React tree, or the scroll system at all, and an
    unsupported browser simply shows the finished drawing;
  · no `<text>` anywhere in these files. Words stay in HTML, so they remain
    selectable, translatable and readable to assistive technology, and the
    diagrams are pure geometry.

Palette and stroke weights match the site's hand-authored SVGs, because these
replace them.
"""

import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "graphics"

PAPER = "#f5f7fa"
BRAND = "#3f6fff"
BRAND_LIGHT = "#93b0ff"

# The investor drawing's canvas. Every layer shares it exactly, so the routes and
# the structure can be stacked as separate images and still line up pixel for
# pixel.
INVESTOR_VIEWBOX = (760, 260)
INVESTOR_NODES = [
    (86, 150, "Sources"),
    (280, 74, "One company"),
    (474, 150, "Plain language"),
    (668, 74, "Your decision"),
]
INVESTOR_LINKS = [(0, 1), (1, 2), (2, 3), (0, 2)]

# The three routes, authored rather than computed: a curve that reads well is
# drawn, not derived. Each one enters differently and stops somewhere else.
INVESTOR_ROUTES = [
    ("beginner", "M 20 208 C 60 208 60 184 86 150 C 132 96 210 74 280 74 C 360 74 420 118 474 150 C 540 186 600 96 668 74"),
    ("curious", "M 20 108 C 52 88 62 150 86 150 C 160 150 220 76 280 74 C 330 92 400 128 474 150"),
    ("busy", "M 20 150 L 86 150 C 200 150 360 132 474 150 C 560 164 620 96 668 74"),
]

# The process route: the same coordinates the inline diagram used.
ROUTE_VIEWBOX = (900, 210)
ROUTE_THREAD = (
    "M -20 100 C 70 100 90 92 150 92 S 250 100 300 100 "
    "C 380 100 400 108 450 108 S 550 100 600 100 "
    "C 680 100 700 86 750 86 S 850 100 920 100"
)
ROUTE_STATIONS = [
    {"key": "find", "x": 150, "y": 92, "stem_to": 34, "above": True},
    {"key": "explain", "x": 450, "y": 108, "stem_to": 168, "above": False},
    {"key": "understand", "x": 750, "y": 86, "stem_to": 34, "above": True},
]
# Where the packet is at each moment of its journey, in viewBox units.
ROUTE_PACKET = [(150, 92), (300, 100), (450, 108), (600, 100), (750, 86)]


def packet_keyframes(points):
    """The packet's journey, keyframed in viewBox units — a transform inside an
    SVG cannot use percentages, so the path is sampled into stops."""
    start_x, start_y = points[0]
    total = len(points) - 1
    stops = []
    for index, (x, y) in enumerate(points):
        stops.append(
            f"    {round(index / total * 100, 1)}% {{ transform: translate({x - start_x}px, {y - start_y}px); }}"
        )
    return "  @keyframes ride {\n" + "\n".join(stops) + "\n  }"


def header(width, height, packet_keys=""):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" fill="none" role="img">
<style>
  /* Drawn once, when the image starts. An SVG loaded as an image animates in
     its own context: this never touches the page's script or its scroll. */
  .draw {{
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    animation: draw 2200ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }}
  @keyframes draw {{
    to {{ stroke-dashoffset: 0; }}
  }}
  /* The packet rides the route, for as long as the image is on screen. */
  .packet {{
    animation: ride 5200ms cubic-bezier(0.35, 0, 0.65, 1) infinite;
  }}
{packet_keys}
  /* A slow halo, so the packet has a pulse rather than a hard edge. */
  .halo {{
    animation: pulse 2600ms ease-in-out infinite;
    transform-origin: center;
    transform-box: fill-box;
  }}
  @keyframes pulse {{
    0%, 100% {{ opacity: 0.35; transform: scale(0.9); }}
    50%      {{ opacity: 0.75; transform: scale(1.25); }}
  }}
  @media (prefers-reduced-motion: reduce) {{
    .draw, .packet, .halo {{ animation: none; }}
    .draw {{ stroke-dashoffset: 0; }}
  }}
</style>
"""


def build_route():
    """The idea section's diagram: a plan, a drawn route, three stations."""
    width, height = ROUTE_VIEWBOX
    svg = [header(width, height, packet_keyframes(ROUTE_PACKET))]
    svg.append(f'<path d="{ROUTE_THREAD}" pathLength="1" stroke="rgba(245,247,250,0.09)" stroke-width="1"/>')
    svg.append(f'<path class="draw" d="{ROUTE_THREAD}" pathLength="1" stroke="{BRAND_LIGHT}" stroke-opacity="0.7" stroke-width="1.5" stroke-linecap="round"/>')

    # The packet: one object, travelling. Percentages are not available to a
    # transform inside an SVG, so it is keyframed in viewBox units.
    start_x, start_y = ROUTE_PACKET[0]
    svg.append(
        f'<g class="packet" transform="translate({start_x} {start_y})">'
        f'<circle class="halo" r="9" fill="{BRAND}" fill-opacity="0.28"/>'
        f'<circle r="3.4" fill="{BRAND_LIGHT}"/>'
        f"</g>"
    )
    for station in ROUTE_STATIONS:
        x, y = station["x"], station["y"]
        stem_y = station["stem_to"]
        svg.append(f'<circle cx="{x}" cy="{y}" r="13" stroke="{BRAND_LIGHT}" stroke-opacity="0.28" stroke-width="1"/>')
        svg.append(f'<circle cx="{x}" cy="{y}" r="3.4" fill="{BRAND}"/>')
        svg.append(
            f'<line x1="{x}" y1="{y + (13 if not station["above"] else -13)}" '
            f'x2="{x}" y2="{stem_y}" stroke="rgba(245,247,250,0.13)" stroke-width="1"/>'
        )

    # 01 — sources converging on the first station.
    for x, y in [(64, 26), (96, 44), (58, 58), (104, 20), (80, 66)]:
        svg.append(f'<circle cx="{x}" cy="{y}" r="1.9" fill="rgba(170,182,198,0.75)"/>')
        svg.append(f'<line x1="{x}" y1="{y}" x2="150" y2="92" stroke="rgba(245,247,250,0.08)" stroke-width="1"/>')

    # 02 — plain language, as ruled lines.
    for index, (x, y, w, h) in enumerate([(378, 126, 144, 7), (378, 144, 106, 5), (378, 158, 128, 5)]):
        opacity = 0.4 if index == 0 else 0.22
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1.5" fill="{PAPER}" fill-opacity="{opacity}"/>')

    # 03 — a hierarchy settling.
    for index, (x, y, w, h) in enumerate([(688, 22, 148, 6), (688, 38, 104, 4), (712, 54, 124, 4), (728, 68, 88, 4)]):
        opacity = 0.4 if index == 0 else 0.22
        svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="1.5" fill="{PAPER}" fill-opacity="{opacity}"/>')

    svg.append("</svg>")
    return "".join(svg)


def build_structure():
    """The investors section's structure: four nodes and the links between them."""
    width, height = INVESTOR_VIEWBOX
    svg = [header(width, height)]
    for a, b in INVESTOR_LINKS:
        ax, ay, _ = INVESTOR_NODES[a]
        bx, by, _ = INVESTOR_NODES[b]
        svg.append(
            f'<line x1="{ax}" y1="{ay}" x2="{bx}" y2="{by}" '
            f'stroke="rgba(245,247,250,0.10)" stroke-width="1"/>'
        )
    for x, y, _ in INVESTOR_NODES:
        svg.append(f'<circle cx="{x}" cy="{y}" r="16" stroke="rgba(245,247,250,0.09)" stroke-width="1"/>')
        svg.append(f'<circle cx="{x}" cy="{y}" r="3.6" fill="rgba(245,247,250,0.8)"/>')
    svg.append("</svg>")
    return "".join(svg)


def build_route_layer(name, path):
    """One investor route, drawn on the shared canvas."""
    width, height = INVESTOR_VIEWBOX
    svg = [header(width, height)]
    svg.append(
        f'<path class="draw" d="{path}" pathLength="1" stroke="{BRAND_LIGHT}" '
        f'stroke-width="1.8" stroke-linecap="round" stroke-opacity="0.95"/>'
    )
    svg.append("</svg>")
    return "".join(svg)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    written = []

    targets = {
        "route.svg": build_route(),
        "investors-structure.svg": build_structure(),
    }
    for name, path in INVESTOR_ROUTES:
        targets[f"investor-{name}.svg"] = build_route_layer(name, path)

    for name, contents in targets.items():
        target = OUT / name
        # Collapse runs of whitespace rather than stripping each line: stripping
        # joins words inside comments and can break a multi-line rule.
        compact = " ".join(contents.split()) if contents.startswith("<svg") is False else contents
        target.write_text(contents)
        written.append((name, target.stat().st_size))

    for name, size in written:
        print(f"  {name}: {size // 1024}kB" if size >= 1024 else f"  {name}: {size}B")
    total = sum(size for _, size in written)
    print(f"graphics payload: {total // 1024}kB across {len(written)} files")


if __name__ == "__main__":
    main()
