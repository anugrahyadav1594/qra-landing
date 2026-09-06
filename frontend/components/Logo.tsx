/** Brand mark — always rendered at original proportions (frontend/public/image.png). */

export function Logo({ className = "h-8 w-auto object-contain" }: { className?: string }) {
  // Plain <img> on purpose: the brand mark must render at original
  // proportions with zero provider-side alteration (no next/image optimization).
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/image.png" alt="Quantrelic QRA logo" className={className} />;
}
