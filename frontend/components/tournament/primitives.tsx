/**
 * Shared visual primitives for the MTT landing page (server-safe: no hooks,
 * no client directive).
 *
 * One system, six compositions: section intros, indexed surfaces, status
 * language, technical annotations and premium empty states. Sections use
 * these building blocks and then add their own layout personality on top.
 */

import type { ReactNode } from "react";

import { CornerMarks, TickRule } from "@/components/tournament/motifs";

/* ── Small typographic helpers ───────────────────────────────────────── */

export function TechLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[9px] uppercase tracking-[0.26em] text-muted ${className}`}
    >
      {children}
    </span>
  );
}

/** Coordinate-style annotation, e.g. "19.0760° N / 72.8777° E". */
export function CoordNote({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`mtt-coord ${className}`}>{children}</span>;
}

/** Section index rendered as an engineering badge. */
export function IndexBadge({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span
      className={`inline-flex h-7 min-w-7 items-center justify-center border border-flare-500/35 bg-flare-500/10 px-1.5 font-mono text-[11px] tracking-[0.12em] text-flare-300 ${className}`}
    >
      {value}
    </span>
  );
}

/* ── Status language ─────────────────────────────────────────────────── */

export function StatusTag({
  state,
  children,
  className = "",
}: {
  state: "confirmed" | "pending" | "live" | "closed";
  children: ReactNode;
  className?: string;
}) {
  const tone =
    state === "confirmed"
      ? "mtt-tag mtt-tag-confirmed"
      : state === "live"
        ? "mtt-tag border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
        : state === "closed"
          ? "mtt-tag border-white/12 bg-white/5 text-muted"
          : "mtt-tag mtt-tag-pending";
  return (
    <span className={`${tone} ${className}`}>
      <span className={`mtt-dot ${state === "confirmed" || state === "live" ? "" : "mtt-dot-hollow"}`} />
      {children}
    </span>
  );
}

/* ── Surfaces ────────────────────────────────────────────────────────── */

export function Surface({
  children,
  className = "",
  notch = true,
  hover = false,
  marks = false,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  notch?: boolean;
  hover?: boolean;
  marks?: boolean;
  tone?: "default" | "flare" | "deep";
}) {
  const toneClass =
    tone === "flare"
      ? "bg-gradient-to-b from-flare-500/[0.07] to-transparent border-flare-500/25"
      : tone === "deep"
        ? "bg-arena-950/70"
        : "";
  return (
    <div
      className={`mtt-surface ${notch ? "mtt-surface-notch" : ""} ${hover ? "mtt-surface-hover" : ""} ${toneClass} ${className}`}
    >
      {marks && <CornerMarks className="text-flare-500/70" />}
      {children}
    </div>
  );
}

/* ── Section intro ───────────────────────────────────────────────────── */

/**
 * The section header used by every redesigned section: index badge, eyebrow
 * with a flare rule, oversized editorial heading, supporting copy and an
 * optional right-hand annotation (metrics, counts, coordinates).
 */
export function SectionIntro({
  index,
  eyebrow,
  title,
  description,
  meta,
  align = "left",
  className = "",
  titleClassName = "",
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}) {
  const centred = align === "center";
  return (
    <div
      className={`${centred ? "mx-auto max-w-2xl text-center" : "max-w-4xl"} ${className}`}
    >
      <div
        className={`flex flex-wrap items-center gap-x-3 gap-y-2 ${centred ? "justify-center" : ""}`}
      >
        {index ? <IndexBadge value={index} /> : null}
        <span className="hidden h-px w-8 bg-gradient-to-r from-flare-500 to-transparent sm:block" />
        <span className="font-mono text-[10px] uppercase tracking-[0.34em] text-flare-300/90">
          {eyebrow}
        </span>
        <TickRule className={`hidden text-white/20 md:block ${centred ? "w-16" : "w-24"}`} ticks={10} />
      </div>

      <h2
        className={`mt-6 font-display font-semibold uppercase leading-[0.98] tracking-tightest text-bone ${titleClassName || "text-[2rem] sm:text-[2.6rem] lg:text-[3.1rem]"}`}
      >
        {title}
      </h2>

      {description ? (
        <p
          className={`mt-5 max-w-2xl text-[15px] leading-relaxed text-ash ${centred ? "mx-auto" : ""}`}
        >
          {description}
        </p>
      ) : null}

      {meta ? (
        <div className={`mt-7 ${centred ? "flex justify-center" : ""}`}>{meta}</div>
      ) : null}
    </div>
  );
}

/* ── Premium empty state ─────────────────────────────────────────────── */

/**
 * Empty states are designed, not apologetic: a large original motif on the
 * left, the state explanation and the enquiry action on the right. Never
 * implies content that has not been confirmed.
 */
export function EmptyStage({
  motif,
  label,
  title,
  description,
  action,
  footnote,
}: {
  motif: ReactNode;
  label: string;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  footnote?: ReactNode;
}) {
  return (
    <Surface className="overflow-hidden">
      <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div className="relative mx-auto w-full max-w-sm text-flare-500/70">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 opacity-70"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, rgba(255,121,47,0.10), transparent 70%)",
            }}
          />
          {motif}
          <div className="mt-2 flex items-center justify-between">
            <TechLabel>Fig. {label}</TechLabel>
            <TechLabel className="text-bone/25">MTT / {label}</TechLabel>
          </div>
        </div>

        <div>
          <StatusTag state="pending">Awaiting confirmation</StatusTag>
          <h3 className="mt-5 font-display text-xl font-semibold uppercase leading-tight tracking-tight text-bone sm:text-2xl">
            {title}
          </h3>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-ash">{description}</p>
          {action ? <div className="mt-7 flex flex-wrap gap-3">{action}</div> : null}
          {footnote ? (
            <p className="mt-6 border-t border-white/6 pt-4 text-xs leading-relaxed text-muted">
              {footnote}
            </p>
          ) : null}
        </div>
      </div>
    </Surface>
  );
}

/* ── Measurement strip used to separate blocks ───────────────────────── */

export function RuleTicks({ className = "", label }: { className?: string; label?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {label ? <TechLabel>{label}</TechLabel> : null}
      <span className="mtt-ticks flex-1 opacity-40" aria-hidden="true" />
    </div>
  );
}
