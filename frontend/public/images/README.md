# MTT artwork assets

## The prize-section artwork

Drop the generated artwork here, **with this exact filename**:

```
frontend/public/images/mtt-prize-background.png
```

That is the only manual step. The section picks it up automatically — no
code change, no rebuild. If the file is absent, the section renders its
dark graphite-and-orange fallback and still looks finished.

## It is a portrait artwork — and it is treated as one

The asset is a **3:4 portrait** environment. It is never converted into a
wide hero background:

| Rule | Value |
|---|---|
| Displayed as | a real image element in a vertical artwork stack |
| Width | 100% of the artwork column (max 1280px, centred) |
| Height | derived from the image — never fixed, never `cover` |
| `object-fit` | `contain` (no crop, no stretch, no zoom-to-fill) |
| `object-position` | `center top` |
| Repeat | `no-repeat` — the artwork is never tiled |
| Reserved height | `--mtt-prize-artwork-height` in `app/globals.css` |

The section is allowed to grow taller because of the image. That is
intentional; the page scrolls naturally.

## Adding more artwork later (vertical stack)

The stack is configured in **one file** — `frontend/lib/prizeArtwork.ts` —
as a list of independently replaceable segments:

```ts
export const PRIZE_ARTWORK: PrizeArtworkSegment[] = [
  { id: "upper", src: "/images/mtt-prize-background-upper.png", width: 1200, height: 1600, enabled: false },
  { id: "main",  src: "/images/mtt-prize-background.png",       width: 1200, height: 1600, enabled: true  },
  { id: "lower", src: "/images/mtt-prize-background-lower.png", width: 1200, height: 1600, enabled: false },
];
```

To add another image: drop the file in this folder, set `enabled: true`
for that segment, and set its real `width` / `height`. That is all.

- Segments render top-to-bottom in array order and stack seamlessly
  (1px overlap guard, feathered top and bottom edges).
- Each segment keeps **its own** aspect ratio — a future segment with a
  different ratio is not stretched to match its neighbour.
- A segment whose file is missing is skipped entirely: no empty
  placeholder, no broken-image icon.
- When you switch another segment on, add a matching term to
  `--mtt-prize-artwork-height` in `app/globals.css` so the reserved height
  still matches (e.g. two 3:4 segments → `... * 4 / 3 * 2`).

## Recommended source spec

| | |
|---|---|
| Aspect ratio | **3:4 portrait** (e.g. 1200 × 1600; 1800 × 2400 for retina) |
| Safe zones | Keep the centre comparatively dark — the ₹1,00,000 panel, the podium and both lower panels sit over the middle of the image |
| Colour | Dark sky, orange lighting, cool waterfront |

Keep the declared `width` / `height` in `lib/prizeArtwork.ts` in step with
the real file to avoid a late layout shift (the CSS keeps the box at the
declared ratio either way, and `object-fit: contain` protects the image).

## Optimisation

The image is loaded as a plain lazy-loaded element (`loading="lazy"`,
`decoding="async"`) so it never blocks first paint and never changes the
layout when it arrives.

Recommended delivery: export a **WebP** (~60–70% smaller) and/or **AVIF**
(~80% smaller) alongside the PNG, keep the PNG as the committed source, and
— if you want the browser to negotiate — serve the alternatives through the
`<picture>` element in the `PrizePool` artwork stack. Only that one
component changes; the segment configuration and every rule above stay
exactly as they are.

(Avoid routing this image through `next/image` unless `sharp` is installed
in the deployment: the optimizer needs it in production and would otherwise
fail the request.)
