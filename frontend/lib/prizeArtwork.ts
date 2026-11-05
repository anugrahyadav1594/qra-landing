/**
 * Replaceable prize-section artwork.
 *
 * The supplied asset is a PORTRAIT 3:4 environmental artwork, not a wide
 * hero background. It is therefore rendered as itself: a real image element
 * at 100% of the artwork column, height derived from its own ratio, with
 * `object-fit: contain`. There is no `cover` anywhere, so nothing is
 * cropped, stretched or zoomed to fill a horizontal container.
 *
 * Segments stack vertically in array order to form one continuous
 * environment. Flip `enabled` to true when the asset exists — optional
 * segments are skipped entirely, so there are never empty placeholders.
 * Each segment keeps its own intrinsic width/height, so a future segment
 * with a different ratio is not stretched to match its neighbours.
 *
 * Adding artwork later = drop the file in `public/images/` and flip the
 * flag. Nothing else changes.
 */

export type PrizeArtworkSegment = {
  /** Stable identifier; also used to track a failed load. */
  id: string;
  /** Public path, e.g. "/images/mtt-prize-background.png". */
  src: string;
  /** Intrinsic pixel size — reserves space and fixes the aspect ratio. */
  width: number;
  height: number;
  /** Optional segments stay off until their asset is present. */
  enabled: boolean;
};

export const PRIZE_ARTWORK: PrizeArtworkSegment[] = [
  // Upper environment — add the file, then set enabled: true.
  {
    id: "upper",
    src: "/images/mtt-prize-background-upper.png",
    width: 1200,
    height: 1600,
    enabled: false,
  },
  // The supplied main artwork.
  {
    id: "main",
    src: "/images/mtt-prize-background.png",
    width: 1200,
    height: 1600,
    enabled: true,
  },
  // Lower environment — add the file, then set enabled: true.
  {
    id: "lower",
    src: "/images/mtt-prize-background-lower.png",
    width: 1200,
    height: 1600,
    enabled: false,
  },
];

/** Segments that should actually render. */
export const ACTIVE_PRIZE_ARTWORK = PRIZE_ARTWORK.filter((segment) => segment.enabled);
