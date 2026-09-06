import { Badge } from "@/components/ui";

const LAYERS = [
  "Company fundamentals",
  "Financial statements",
  "Filings & disclosures",
  "News & developments",
  "Risks & flags",
  "Catalysts",
];

const THESIS_CHIPS = ["Business", "Fundamentals", "Growth", "Risks", "Catalysts", "Valuation"];

/** Hero: copy left, conceptual animated research workspace right.
 * All workspace content is illustrative — labelled as such. */
export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background treatment */}
      <div className="hero-grid absolute inset-0" aria-hidden="true" />
      <div
        className="absolute -top-48 right-[-12%] h-[520px] w-[520px] rounded-full bg-signal-600/20 blur-[150px] motion-safe:block"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-[-24%] left-[-12%] h-[420px] w-[420px] rounded-full bg-aqua-500/10 blur-[130px] motion-safe:block"
        aria-hidden="true"
      />
      <div className="drift-dot absolute left-[16%] top-[22%] hidden h-1.5 w-1.5 rounded-full bg-signal-400/70 lg:block" style={{ "--drift-x": "22px", "--drift-y": "-26px" } as React.CSSProperties} aria-hidden="true" />
      <div className="drift-dot absolute left-[46%] top-[64%] hidden h-1 w-1 rounded-full bg-aqua-300/60 lg:block" style={{ "--drift-x": "-18px", "--drift-y": "-20px", animationDelay: "1.2s" } as React.CSSProperties} aria-hidden="true" />
      <div className="drift-dot absolute right-[24%] top-[30%] hidden h-1 w-1 rounded-full bg-paper/50 lg:block" style={{ "--drift-x": "16px", "--drift-y": "22px", animationDelay: "2.1s" } as React.CSSProperties} aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl gap-14 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-28">
        {/* ── Copy ─────────────────────────────────────────────────── */}
        <div>
          <p
            className="hero-rise text-xs font-semibold uppercase tracking-[0.32em] text-signal-400"
            style={{ animationDelay: "0.05s" }}
          >
            Quantrelic Research Agent
          </p>
          <h1
            className="hero-rise mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tightest text-paper sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "0.15s" }}
          >
            From ticker
            <br />
            to thesis.
          </h1>
          <p
            className="hero-rise mt-7 max-w-xl text-lg leading-relaxed text-paper-dim/80"
            style={{ animationDelay: "0.28s" }}
          >
            QRA investigates financial information, company fundamentals, filings, news, and the
            signals that matter — helping investors research with greater depth and clarity.
          </p>
          <p
            className="hero-rise mt-7 text-xs font-semibold uppercase tracking-[0.3em] text-aqua-300"
            style={{ animationDelay: "0.38s" }}
          >
            QRA investigates. You decide.
          </p>
          <div
            className="hero-rise mt-10 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: "0.48s" }}
          >
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center rounded-full bg-paper px-7 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white"
            >
              Join the waitlist
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-paper transition hover:border-white/30 hover:bg-white/5"
            >
              See how QRA works
            </a>
          </div>
        </div>

        {/* ── Conceptual research workspace ────────────────────────── */}
        <div className="relative">
          <div className="hero-rise" style={{ animationDelay: "0.35s" }}>
            <div className="relative rounded-2xl border border-white/10 bg-ink-900/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Badge tone="muted">
                  <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-aqua-400" aria-hidden="true" />
                  Conceptual
                </Badge>
                <p className="text-[10px] uppercase tracking-[0.18em] text-paper-dim/40">
                  Illustrative
                </p>
              </div>

              {/* Ticker */}
              <div className="workspace-step mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-850 p-4" style={{ animationDelay: "0.55s" }}>
                <div>
                  <p className="font-mono text-lg font-semibold tracking-tight text-paper">RELIANCE</p>
                  <p className="mt-0.5 font-mono text-xs text-paper-dim/50">NSE: RELIANCE</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-signal-500/40 bg-signal-500/10 px-4 py-1.5 text-xs font-semibold text-signal-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                  Investigate
                </span>
              </div>

              {/* Flow */}
              <div className="mx-auto flex h-8 w-px items-center justify-center" aria-hidden="true">
                <svg className="h-full w-6 -rotate-90" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v16M7 13l5 5 5-5" stroke="rgba(110,135,255,0.5)" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Investigation layers */}
              <ul className="space-y-2">
                {LAYERS.map((layer, index) => (
                  <li
                    key={layer}
                    className="workspace-step flex items-center gap-3 rounded-lg border border-white/5 bg-ink-850/70 px-4 py-2.5"
                    style={{ animationDelay: `${0.75 + index * 0.16}s` }}
                  >
                    <span className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-signal-400" style={{ animationDelay: `${index * 0.35}s` }} aria-hidden="true" />
                    <span className="text-sm text-paper-dim/90">{layer}</span>
                  </li>
                ))}
              </ul>

              {/* Synthesis → thesis */}
              <div className="mt-5 grid gap-3 sm:grid-cols-[auto_auto] sm:items-center">
                <div
                  className="workspace-step rounded-lg border border-aqua-500/25 bg-aqua-500/5 px-4 py-2.5 text-sm font-medium text-aqua-300"
                  style={{ animationDelay: "1.85s" }}
                >
                  Research synthesis
                </div>
                <svg className="hidden h-5 w-8 self-center text-paper-dim/40 sm:block" viewBox="0 0 32 20" fill="none" aria-hidden="true">
                  <path d="M2 10h24M22 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>

              <div
                className="workspace-step mt-3 rounded-xl border border-signal-500/25 bg-signal-500/[0.06] p-4"
                style={{ animationDelay: "2.05s" }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-signal-300">
                  Investment thesis
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {THESIS_CHIPS.map((chip, index) => (
                    <span
                      key={chip}
                      className={`chip-flow ${index % 2 === 0 ? "chip-left" : "chip-right"} inline-flex items-center rounded-full border border-white/10 bg-ink-800 px-3 py-1 text-xs text-paper-dim/90`}
                      style={{ animationDelay: `${2.15 + index * 0.12}s` }}
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 px-1 text-xs leading-relaxed text-paper-dim/40">
              Conceptual representation of the research process — illustrative.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
