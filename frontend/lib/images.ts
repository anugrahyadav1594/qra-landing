/**
 * Visual assets.
 *
 * The photography and abstract imagery used across the site is generated
 * externally and dropped into `public/images/` — no code change is needed to
 * publish it. These constants are the only place the paths live, so the exact
 * filenames are declared once and referenced everywhere.
 *
 * Every asset is optional: when a file has not been placed yet, `ImageAsset`
 * renders the dark conceptual fallback instead (no broken image, no layout
 * shift). Images never carry typography — all text stays in HTML.
 */

export const IMAGE_ASSETS = {
  hero: "/images/qra-hero.webp",
  informationOverload: "/images/qra-information-overload.webp",
  clarity: "/images/qra-clarity.webp",
  investor: "/images/qra-investor.webp",
  trust: "/images/qra-trust.webp",
  about: "/images/qra-about.webp",
} as const;

export type ImageAssetKey = keyof typeof IMAGE_ASSETS;

/**
 * Alt text describes what the image shows. These are atmosphere, not
 * information: nothing in them is needed to understand the page, so they are
 * written to be useful when a screen reader does read them, and short enough
 * not to get in the way when it does not.
 */
export const IMAGE_ALTS: Record<ImageAssetKey, string> = {
  hero: "Abstract financial information flowing into a structured digital interface",
  informationOverload:
    "Scattered financial documents, charts and filings drifting across a dark surface",
  clarity: "A calm dark environment in which scattered data resolves into ordered, even lines",
  investor: "A person reading financial information on a screen in a dimly lit room",
  trust: "Dark cinematic financial technology environment lit by fine, precise lines",
  about: "A quiet minimal workspace suggesting careful, long-term thinking about finance",
};
