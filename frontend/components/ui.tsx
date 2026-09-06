/** Small shared UI primitives (no icon library, no client state). */

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-xs font-semibold uppercase tracking-[0.28em] text-signal-400 ${className}`}>
      {children}
    </p>
  );
}

export function Badge({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "success" | "muted";
}) {
  const tones = {
    brand: "border-signal-500/40 bg-signal-500/10 text-signal-300",
    success: "border-aqua-500/40 bg-aqua-500/10 text-aqua-300",
    muted: "border-white/10 bg-white/5 text-paper-dim/70",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="font-display text-3xl font-semibold tracking-tightest text-paper sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base leading-relaxed text-paper-dim/80">{description}</p>}
    </div>
  );
}

export function FieldError({ id, children }: { id: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-red-400">
      {children}
    </p>
  );
}

export const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-paper " +
  "placeholder:text-paper-dim/40 focus:border-signal-500 focus:outline-none focus:ring-2 focus:ring-signal-500/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const labelClass = "mb-1.5 block text-sm font-medium text-paper-dim";
