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

def header(width, height):
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
  /* A slow halo, so a node has a pulse rather than a hard edge. */
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
    .draw, .halo {{ animation: none; }}
    .draw {{ stroke-dashoffset: 0; }}
  }}
</style>
"""


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
