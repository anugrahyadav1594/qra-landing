import { Reveal } from "@/components/Reveal";
import { EmptyState, SectionHeader } from "@/components/tournament/ui";
import {
  SPONSOR_CATEGORY_LABELS,
  SPONSOR_CATEGORY_ORDER,
  type Sponsor,
} from "@/lib/tournament";

/**
 * Sponsors and partners, grouped by tier.
 *
 * Title sponsors get the largest placement, associate sponsors a secondary
 * one and partners a compact row. Only administrator-uploaded logos are
 * rendered — an unbracked sponsor keeps a typographic treatment, and an
 * empty category renders nothing at all (no broken placeholders).
 */
export function SponsorWall({ sponsors }: { sponsors: Sponsor[] }) {
  const grouped = SPONSOR_CATEGORY_ORDER.map((category) => ({
    category,
    label: SPONSOR_CATEGORY_LABELS[category] ?? category,
    items: sponsors.filter((sponsor) => sponsor.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section id="sponsors" className="relative scroll-mt-20 border-t border-white/8 bg-arena-900 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeader
            index="04"
            eyebrow="Sponsors & partners"
            title={
              <>
                Backed by
                <br />
                the industry.
              </>
            }
            description="Partners are added and ordered by the organisers. Nothing appears here until a partnership is confirmed."
          />
        </Reveal>

        <Reveal delay={80}>
          <div className="mt-12">
            {sponsors.length === 0 ? (
              <EmptyState
                icon="ring"
                title="Partnerships are being finalised"
                description="Sponsor and partner announcements are published by the organisers as they are confirmed. This section stays empty rather than showing placeholder brands."
              />
            ) : (
              <div className="space-y-12">
                {grouped.map((group) => {
                  const prominent = group.category === "title_sponsor";
                  const secondary = group.category === "associate_sponsor";
                  return (
                    <div key={group.category}>
                      <div className="flex items-center gap-4">
                        <h3 className="font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
                          {group.label}
                        </h3>
                        <span className="h-px flex-1 bg-white/8" />
                      </div>
                      <ul
                        className={`mt-6 grid gap-4 ${
                          prominent
                            ? "grid-cols-1 sm:grid-cols-2"
                            : secondary
                              ? "grid-cols-2 sm:grid-cols-3"
                              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                        }`}
                      >
                        {group.items.map((sponsor) => (
                          <li key={sponsor.id}>
                            <SponsorTile
                              sponsor={sponsor}
                              size={prominent ? "lg" : secondary ? "md" : "sm"}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SponsorTile({ sponsor, size }: { sponsor: Sponsor; size: "lg" | "md" | "sm" }) {
  const height = size === "lg" ? "h-32 sm:h-40" : size === "md" ? "h-24 sm:h-28" : "h-20 sm:h-24";
  const body = (
    <>
      <div className={`grid w-full ${height} place-items-center px-6`}>
        {sponsor.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sponsor.logo_url}
            alt={`${sponsor.name} logo`}
            className="max-h-full w-auto max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <span
            className={`font-display font-semibold uppercase tracking-tight text-bone/80 ${
              size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm"
            }`}
          >
            {sponsor.name}
          </span>
        )}
      </div>
      <p
        className={`mt-auto border-t border-white/8 px-4 py-3 font-mono uppercase tracking-[0.2em] text-ash ${
          size === "lg" ? "text-[10px]" : "text-[9px]"
        }`}
      >
        {sponsor.name}
      </p>
    </>
  );

  const shell = "logo-tile arena-panel arena-panel-sm flex h-full flex-col overflow-hidden";

  if (sponsor.website_url) {
    return (
      <a
        href={sponsor.website_url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${shell} arena-focus block`}
      >
        {body}
      </a>
    );
  }
  return <div className={shell}>{body}</div>;
}
