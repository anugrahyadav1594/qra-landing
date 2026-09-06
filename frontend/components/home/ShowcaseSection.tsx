import { Reveal } from "@/components/Reveal";
import { Badge, Eyebrow } from "@/components/ui";

const CONTEXT_TABS = [
  "Overview",
  "Fundamentals",
  "Filings",
  "Evidence",
  "Developments",
  "Risks",
  "Catalysts",
];

const EVIDENCE = [
  {
    tags: ["Annual report FY25"],
    tone: "signal",
    body: "Segment reporting reviewed: core, growth and emerging businesses.",
  },
  {
    tags: ["Earnings call Q2 FY26"],
    tone: "signal",
    body: "Management commentary on capacity plans and margin outlook.",
  },
  {
    tags: ["Exchange filing", "Shareholding"],
    tone: "aqua",
    body: "Promoter stake unchanged; two institutional holders added.",
  },
  {
    tags: ["News", "Development"],
    tone: "aqua",
    body: "Sector regulatory development tracked for timeline and impact.",
  },
  {
    tags: ["Risk flag", "Watch"],
    tone: "warn",
    body: "Input-cost sensitivity flagged for the next two quarters.",
  },
  {
    tags: ["Catalyst", "Ahead"],
    tone: "aqua",
    body: "Potential capacity announcement expected on the next earnings call.",
  },
];

const THESIS_NOTES = [
  "Business: diversified core with a clear growth line.",
  "Fundamentals: stable margins through the cycle.",
  "Growth: capacity build-out is the key variable.",
  "Risks: input costs and the execution timeline.",
  "Valuation: re-rate depends on catalyst timing.",
];

const TIMELINE = ["FY23", "FY24", "FY25", "Today"];

const TAG_TONES: Record<string, string> = {
  signal: "border-signal-500/30 bg-signal-500/10 text-signal-300",
  aqua: "border-aqua-500/30 bg-aqua-500/10 text-aqua-300",
  warn: "border-amber-400/30 bg-amber-400/10 text-amber-300",
};

/** The product, shown as a conceptual research interface. Every figure is
 * illustrative demo data — labelled as such on the UI. */
export function ShowcaseSection() {
  return (
    <section className="border-y border-white/5 bg-ink-900/40">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <Reveal>
          <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Eyebrow>The product</Eyebrow>
              <h2 className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tightest text-paper sm:text-5xl">
                One workspace. The whole investigation.
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="muted">Illustrative demo data</Badge>
              <Badge tone="muted">Conceptual interface</Badge>
            </div>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-950/80 shadow-2xl shadow-black/40">
            <div className="grid lg:grid-cols-[220px_1fr_280px]">
              {/* Context tabs */}
              <aside className="border-b border-white/5 p-5 lg:border-b-0 lg:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper-dim/40">
                  Context
                </p>
                <ul className="mt-4 space-y-1">
                  {CONTEXT_TABS.map((tab, index) => (
                    <li key={tab}>
                      <span
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          index === 3
                            ? "bg-signal-500/15 font-semibold text-signal-300"
                            : "text-paper-dim/60"
                        }`}
                      >
                        {index === 3 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-signal-400" aria-hidden="true" />
                        )}
                        {tab}
                      </span>
                    </li>
                  ))}
                </ul>
              </aside>

              {/* Evidence list */}
              <div className="border-b border-white/5 p-5 lg:border-b-0 lg:border-r lg:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper-dim/40">
                  Evidence
                </p>
                <ul className="mt-4 space-y-3">
                  {EVIDENCE.map((item, index) => (
                    <li
                      key={item.body}
                      className="ev-item rounded-xl border border-white/5 bg-ink-900/70 p-4"
                      style={{ animationDelay: `${0.15 + index * 0.12}s` }}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${TAG_TONES[item.tone]}`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2.5 text-sm leading-relaxed text-paper-dim/85">{item.body}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Thesis notes + timeline */}
              <div className="p-5 lg:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper-dim/40">
                  Thesis notes
                </p>
                <ul className="mt-4 space-y-3">
                  {THESIS_NOTES.map((note, index) => (
                    <li
                      key={note}
                      className="ev-item flex gap-2.5 text-sm leading-relaxed text-paper-dim/85"
                      style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-aqua-400/80" aria-hidden="true" />
                      {note}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper-dim/40">
                    Timeline
                  </p>
                  <div className="relative mt-6 pb-1">
                    <div
                      className="absolute left-2 right-2 top-[5px] h-px bg-gradient-to-r from-signal-500/60 via-aqua-500/40 to-aqua-400/70"
                      aria-hidden="true"
                    />
                    <ol className="relative flex justify-between">
                      {TIMELINE.map((point, index) => (
                        <li key={point} className="flex flex-col items-center gap-2">
                          <span
                            className={`h-3 w-3 rounded-full border-2 ${
                              index === TIMELINE.length - 1
                                ? "pulse-dot border-aqua-400 bg-aqua-500/40"
                                : "border-signal-500/60 bg-ink-950"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="font-mono text-[10px] text-paper-dim/50">{point}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 px-1 text-xs text-paper-dim/40">
            Conceptual interface with illustrative demo data — not live market information.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
