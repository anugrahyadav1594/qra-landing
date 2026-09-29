/** Shared UI primitives — dark editorial system, no icon library.
 *
 * These are the reusable building blocks referenced by every page:
 * Section, SectionLabel, SectionStatement, Button, DataCard, StatRow,
 * SourceBadge, FieldError and the form field classes.
 */

import Link from "next/link";

import type { Direction } from "@/lib/content";

export const shellClass = "mx-auto w-full max-w-shell px-5 sm:px-6";

/**
 * Page section: consistent vertical rhythm, a background tone and a stable
 * anchor id (used by the navbar scroll-spy and hash links).
 */
export function Section({
  id,
  children,
  tone = "base",
  className = "",
  labelledBy,
}: {
  id?: string;
  children: React.ReactNode;
  tone?: "base" | "raised" | "deep";
  className?: string;
  labelledBy?: string;
}) {
  const tones = {
    base: "",
    raised: "bg-ink-900",
    deep: "bg-ink-850",
  };
  return (
    <section
      id={id}
      data-section={id}
      aria-labelledby={labelledBy}
      className={`relative ${tones[tone]} ${className}`}
    >
      <div className={`${shellClass} py-20 sm:py-28`}>{children}</div>
    </section>
  );
}

/** Tiny uppercase metadata label — the site's financial-product vocabulary. */
export function SectionLabel({
  children,
  className = "",
  tone = "faint",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "faint" | "brand";
}) {
  return (
    <p className={`micro ${tone === "brand" ? "!text-brand-400" : ""} ${className}`}>{children}</p>
  );
}

/** Oversized editorial statement — one idea, two or three lines. */
export function SectionStatement({
  lines,
  size = "lg",
  as: Tag = "h2",
  className = "",
  id,
}: {
  lines: readonly string[];
  size?: "md" | "lg";
  as?: "h2" | "h3";
  className?: string;
  id?: string;
}) {
  const sizes = {
    md: "text-3xl sm:text-4xl",
    lg: "text-[2.1rem] leading-[1.08] sm:text-5xl sm:leading-[1.05] lg:text-[3.4rem]",
  };
  return (
    <Tag
      id={id}
      className={`font-display font-semibold tracking-tightest text-paper ${sizes[size]} ${className}`}
    >
      {lines.map((line, index) => (
        <span key={line} className="block">
          {line}
          {index < lines.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
  size?: "md" | "lg";
  className?: string;
  href?: string;
  type?: "button" | "submit";
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  "data-testid"?: string;
  "aria-describedby"?: string;
};

const BUTTON_VARIANTS = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 shadow-[0_10px_30px_-12px_rgba(59,102,255,0.65)]",
  outline:
    "border border-line-strong text-paper hover:border-brand-500/60 hover:bg-brand-500/[0.08]",
  ghost: "text-paper-dim hover:text-paper",
} as const;

const BUTTON_SIZES = {
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

/** Primary action element. Renders a link when `href` is given. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-md font-semibold transition duration-200 ease-editorial disabled:opacity-60 ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes} data-testid={rest["data-testid"]}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}

/**
 * Direction of a value in an illustrative interface.
 *
 * Deliberately neutral in colour: movement up or down is not automatically
 * good or bad (falling debt and falling profit are not the same story), so the
 * glyph carries the direction and the explanation carries the meaning.
 */
export function DirectionMark({ direction }: { direction: Direction }) {
  const glyphs = { up: "↑", down: "↓", flat: "→" };
  return (
    <span
      className="font-mono text-xs text-paper-dim"
      aria-label={direction === "flat" ? "unchanged" : `trending ${direction}`}
      role="img"
    >
      {glyphs[direction]}
    </span>
  );
}

/** A single labelled value inside an illustrative interface. */
export function StatRow({
  label,
  value,
  direction,
  className = "",
  delay = 0,
}: {
  label: string;
  value: string;
  direction?: Direction;
  className?: string;
  delay?: number;
}) {
  return (
    <div
      className={`seq flex items-baseline justify-between gap-4 border-b border-line-faint py-2.5 last:border-b-0 ${className}`}
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      <span className="text-sm text-paper-dim">{label}</span>
      <span className="flex items-center gap-2.5">
        <span className="value-placeholder font-mono text-sm">{value}</span>
        {direction && <DirectionMark direction={direction} />}
      </span>
    </div>
  );
}

/** Small panel showing NUMBER → MEANING → SOURCE. */
export function DataCard({
  label,
  value,
  detail,
  className = "",
}: {
  label: string;
  value: string;
  detail: string;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-line bg-ink-850/80 p-5 ${className}`}>
      <SectionLabel>{label}</SectionLabel>
      <p className="mt-3 font-display text-lg font-semibold tracking-tight text-paper">{value}</p>
      <p className="mt-2 text-sm leading-relaxed text-paper-dim">{detail}</p>
    </div>
  );
}

/** Source marker — always attached to an explanation, never floating free. */
export function SourceBadge({
  label,
  detail,
  open = false,
  className = "",
}: {
  label: string;
  detail?: string;
  open?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex flex-col gap-1 rounded border border-line bg-ink-900/80 px-3 py-1.5 ${className}`}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-400" />
        <span className="micro !tracking-[0.16em] text-paper-dim">Source</span>
        <span className="text-xs text-paper">{label}</span>
      </span>
      {open && detail && (
        <span className="max-w-xs text-xs leading-relaxed text-paper-mute">{detail}</span>
      )}
    </span>
  );
}

/** Quiet note used under illustrative visuals and around forms. */
export function Note({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-xs leading-relaxed text-paper-faint ${className}`}>{children}</p>;
}

export function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-danger">
      {children}
    </p>
  );
}

export const inputClass =
  "w-full rounded-md border border-line-strong bg-ink-900 px-3.5 py-3 text-base text-paper " +
  "placeholder:text-paper-faint transition-colors focus:border-brand-500 focus:outline-none " +
  "focus:ring-2 focus:ring-brand-500/25 disabled:cursor-not-allowed disabled:opacity-60";

export const labelClass = "mb-1.5 block text-sm font-medium text-paper-dim";
