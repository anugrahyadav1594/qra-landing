# MTT artwork assets

## The replaceable prize-section background

Drop the generated championship artwork here, **with this exact filename**:

```
frontend/public/images/mtt-prize-background.png
```

That is the only manual step. The prize section picks it up automatically —
no code change, no rebuild of any component. If the file is absent, the
section renders its designed fallback (graphite gradient, Mumbai horizon
silhouette, orange market wave, radial measurement geometry, fine grid) and
looks finished on its own.

### How it is wired

The path lives in exactly one place — a CSS custom property in
`frontend/app/globals.css`:

```css
:root {
  --mtt-prize-artwork: url("/images/mtt-prize-background.png");
  --mtt-prize-artwork-position: center center;
  --mtt-prize-artwork-size: cover;
  --mtt-prize-veil: 0.74;
}
```

`.mtt-prize-artwork` is the only rule that consumes it. Change those
variables (or the media-query overrides below them) to reposition or
re-tune the artwork; nothing else needs to know the filename.

- Desktop: `cover`, `center center`.
- Tablet / laptop: nudged to `center 42%` so the skyline sits behind the
  podium rather than behind the copy.
- Mobile: `58% 28%` with a stronger veil, so the Gateway of India stays left
  and the content column keeps its contrast.
- `background-attachment` is **not** fixed (mobile rendering / performance).
- The image is loaded as a CSS background, so it never blocks first paint.

### Recommended source spec

| | |
|---|---|
| Aspect ratio | 3:2 (e.g. 2400 × 1600) — the section is tall, `cover` crops the sides |
| Minimum | 1920 × 1280 |
| Colour | Dark graphite sky, orange lighting, cool waterfront |
| Safe zones | Keep the centre 55% comparatively quiet and dark; the ₹1,00,000 panel, the podium and both lower panels sit there |

### Optimisation recommendation

Keep the agreed **`.png` source path** as the committed asset — it is what
the code requests. For delivery, also export:

- `mtt-prize-background.webp` (~60–70% smaller) and
- `mtt-prize-background.avif` (~80% smaller)

and, if you want the browser to negotiate, add them as extra `image-set()`
sources in the single `--mtt-prize-artwork` declaration in `globals.css`;
the PNG stays as the final fallback in that list. Only that one declaration
changes — no component edits.

Target under ~450 kB for the PNG, under ~150 kB for WebP/AVIF at 2400 px
wide.
