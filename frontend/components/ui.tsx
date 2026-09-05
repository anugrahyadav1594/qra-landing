/** Small shared UI primitives (no icon library, no client state). */

export function Badge({ children, tone = "brand" }: { children: React.ReactNode; tone?: "brand" | "success" | "muted" }) {
  const tones = {
    brand: "border-brand-500/40 bg-brand-500/10 text-brand-400",
    success: "border-accent-500/40 bg-accent-500/10 text-accent-400",
    muted: "border-white/10 bg-white/5 text-zinc-400",
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
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-400">
          {eyebrow}
        </p>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-zinc-400">{description}</p>}
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
  "w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white " +
  "placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30 " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";
