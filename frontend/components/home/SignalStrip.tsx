const SIGNALS = [
  "Company filings",
  "Financial statements",
  "Earnings calls",
  "Shareholding changes",
  "Management commentary",
  "Exchange disclosures",
  "Sector news",
  "Fundamentals",
  "Risks & flags",
  "Catalysts",
];

/** Quiet marquee of the signal types QRA is designed to connect. */
export function SignalStrip() {
  const items = [...SIGNALS, ...SIGNALS];
  return (
    <div className="overflow-hidden border-y border-white/5 bg-ink-900/50 py-4" aria-hidden="true">
      <div className="marquee-track">
        {items.map((signal, index) => (
          <span
            key={`${signal}-${index}`}
            className="mx-7 flex shrink-0 items-center gap-3 whitespace-nowrap text-xs uppercase tracking-[0.22em] text-paper-dim/45"
          >
            <span
              className="pulse-soft h-1 w-1 rounded-full bg-signal-400/80"
              style={{ animationDelay: `${(index % 5) * 0.6}s` }}
            />
            {signal}
          </span>
        ))}
      </div>
    </div>
  );
}
