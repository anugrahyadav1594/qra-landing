/** Shared UI primitives — light editorial theme, no icon library. */

/** Page container. Every section shares the same measure and gutters. */
export const shellClass = "mx-auto w-full max-w-shell px-5 sm:px-6";

/**
 * Homepage section wrapper: consistent vertical rhythm, a full-bleed tone and
 * a stable anchor id (used by the navbar scroll-spy and hash links).
 */
export function Section({
  id,
  children,
  tone = "canvas",
  className = "",
  labelledBy,
}: {
  id: string;
  children: React.ReactNode;
  tone?: "canvas" | "sunken" | "dark";
  className?: string;
  labelledBy?: string;
}) {
  const tones = {
    canvas: "",
    sunken: "bg-canvas-sunken",
    dark: "bg-ink-900 text-white",
  };
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={labelledBy}
      className={`${tones[tone]} ${className}`}
    >
      <div className={`${shellClass} py-20 sm:py-24`}>{children}</div>
    </section>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent ${className}`}
    >
      {children}
    </p>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "accent" | "positive" | "muted";
}) {
  const tones = {
    accent: "border-accent/25 bg-accent-50 text-accent-700",
    positive: "border-positive/25 bg-positive-50 text-positive",
    muted: "border-ink/10 bg-white text-muted",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-[#B42318]">
      {children}
    </p>
  );
}

export const inputClass =
  "w-full rounded-md border border-ink/15 bg-white px-3.5 py-3 text-base text-ink " +
  "placeholder:text-muted-400 focus:border-accent focus:outline-none " +
  "focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";

export const labelClass = "mb-1.5 block text-sm font-medium text-ink-700";

