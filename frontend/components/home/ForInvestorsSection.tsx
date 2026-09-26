import { Reveal } from "@/components/Reveal";
import { Section } from "@/components/ui";

const AUDIENCES = [
  {
    label: "The beginner",
    quote: "I\u2019ve started investing, but financial terms still feel confusing.",
    body: "Start with the words and the numbers explained plainly, then build up.",
  },
  {
    label: "The curious investor",
    quote: "I want to understand a company before putting my money into it.",
    body: "Go company by company, at your own pace, with the important parts in front of you.",
  },
  {
    label: "The busy investor",
    quote: "I know the basics, but I don\u2019t have hours to connect everything myself.",
    body: "Keep the understanding, skip the gathering.",
  },
];

/** Who it is for — three honest portraits, no segmentation jargon. */
export function ForInvestorsSection() {
  return (
    <Section id="for-investors" labelledBy="for-investors-heading">
      <Reveal>
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-accent">
            Who it&rsquo;s for
          </p>
          <h2
            id="for-investors-heading"
            className="mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tightest text-ink sm:text-[2.5rem]"
          >
            Built for people who want to understand before they invest.
          </h2>
        </div>

        <dl className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {AUDIENCES.map((audience) => (
            <div key={audience.label} className="border-t border-ink/15 pt-6">
              <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {audience.label}
              </dt>
              <dd className="mt-4">
                <p className="font-display text-lg font-semibold leading-snug tracking-tight text-ink">
                  &ldquo;{audience.quote}&rdquo;
                </p>
                <p className="mt-3 text-base leading-relaxed text-muted">{audience.body}</p>
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-14">
          <a
            href="#waitlist"
            className="inline-flex items-center justify-center rounded-md bg-accent px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-700"
          >
            Join the waitlist
          </a>
        </div>
      </Reveal>
    </Section>
  );
}
