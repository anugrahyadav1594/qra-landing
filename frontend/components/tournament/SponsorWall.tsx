import Link from "next/link";

import { Reveal } from "@/components/Reveal";
import { ExhibitionWall, TickRule } from "@/components/tournament/motifs";
import {
  CoordNote,
  EmptyStage,
  SectionIntro,
  StatusTag,
  Surface,
  TechLabel,
} from "@/components/tournament/primitives";
import {
  SPONSOR_CATEGORY_LABELS,
  SPONSOR_CATEGORY_ORDER,
  type Sponsor,
} from "@/lib/tournament";

/**
 * SECTION D — Partner Exhibition Wall.
 *
 * Partnerships are exhibited, not listed: hanging wires, spotlit frames and
 * plinths, with strict logo sizing rules so marks of different proportions
 * still read as one wall. Categories from the data model drive placement —
 * title sponsors take the large frames, associate sponsors the medium ones
 * and partners the compact row.
 *
 * Nothing is invented: with no confirmed partners the frames stay empty and
 * the section explains why rather than filling the wall with placeholder
 * brands.
 */
export function SponsorWall({ sponsors }: { sponsors: Sponsor[] }) {
  const grouped = SPONSOR_CATEGORY_ORDER.map((category) => ({
    category,
    label: SPONSOR_CATEGORY_LABELS[category] ?? category,
    items: sponsors.filter((sponsor) => sponsor.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <section
      id="sponsors"
      className="mtt-section mtt-grid scroll-mt-20 overflow-hidden bg-arena-900"
    >
      <div
        aria-hidden="true"
        className="mtt-spotlight pointer-events-none absolute inset-x-0 top-0 h-72"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <SectionIntro
                index="04"
                eyebrow="Sponsors & partners"
                title={
                  <>
                    Backed by
                    <br />
                    the industry.
                  </>
                }
                description="Partners are added and ordered by the organisers. Every mark on this wall belongs to a confirmed partnership — the wall stays empty rather than showing placeholder brands."
              />
            </div>

            <div className="lg:col-span-4">
              <div className="border-t border-white/10 pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <TechLabel>Partners confirmed</TechLabel>
                  <span className="mtt-figure font-display text-2xl font-semibold text-bone">
                    {String(sponsors.length).padStart(2, "0")}
                  </span>
                </div>
                <TickRule className="mt-4 text-white/20" ticks={14} />
                <p className="mt-4 text-xs leading-relaxed text-muted">
                  {sponsors.length > 0
                    ? `${grouped.length} ${grouped.length === 1 ? "tier" : "tiers"} on the wall · partnership enquiries are open.`
                    : "Partnership tiers are open — title sponsor, associate sponsor and event partner."}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12 sm:mt-14">
            {sponsors.length === 0 ? (
              <EmptyStage
                label="04 / Partner wall"
                motif={<ExhibitionWall className="h-auto w-full" />}
                title="Partnerships are being finalised"
                description="Sponsor and partner announcements are published by the organisers as they are confirmed. The frames on this wall stay empty until a partnership is signed — no placeholder brands, no assumed associations."
                action={
                  <>
                    <Link
                      href="/contact"
                      className="btn-flare arena-focus rounded-full px-6 py-3 text-sm"
                    >
                      Partnership enquiries
                    </Link>
                    <Link
                      href="/tournament"
                      className="btn-ghost arena-focus rounded-full px-6 py-3 text-sm"
                    >
                      See the tournament
                    </Link>
                  </>
                }
                footnote={
                  <>
                    Partnership tiers: title sponsor · associate sponsor · event partner · ecosystem
                    and community partners.
                  </>
                }
              />
            ) : (
              <div className="space-y-14">
                {grouped.map((group) => {
                  const prominent = group.category === "title_sponsor";
                  const secondary = group.category === "associate_sponsor";
                  return (
                    <div key={group.category}>
                      {/* Tier rail */}
                      <div className="flex items-center gap-4">
                        <TechLabel className="text-ash">{group.label}</TechLabel>
                        <span className="h-px flex-1 bg-white/[0.09]" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-muted">
                          {String(group.items.length).padStart(2, "0")}{" "}
                          {group.items.length === 1 ? "partner" : "partners"}
                        </span>
                      </div>

                      {/* Gallery hanging wires for the prominent tier */}
                      {prominent && (
                        <div className="mt-6 hidden h-8 justify-around sm:flex" aria-hidden="true">
                          {group.items.map((sponsor) => (
                            <span key={sponsor.id} className="mtt-wire h-8 w-px" />
                          ))}
                        </div>
                      )}

                      <ul
                        className={`mt-6 grid gap-4 ${
                          prominent
                            ? "grid-cols-1 sm:grid-cols-2"
                            : secondary
                              ? "grid-cols-2 sm:grid-cols-3"
                              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                        } ${prominent ? "sm:mt-0" : ""}`}
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

                <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-xl text-xs leading-relaxed text-muted">
                    Partnership enquiries are handled directly by the organisers. Tier placement does
                    not imply endorsement of any trading product or service.
                  </p>
                  <Link
                    href="/contact"
                    className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.24em] text-flare-300 underline decoration-flare-500/40 underline-offset-4 transition hover:text-flare-200"
                  >
                    Become a partner
                  </Link>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Logo presentation rules: a fixed frame height per tier, the mark centred
 * and capped on both axes, desaturated until hover so mixed brand colours
 * still read as one exhibition.
 */
function SponsorTile({ sponsor, size }: { sponsor: Sponsor; size: "lg" | "md" | "sm" }) {
  const frame = size === "lg" ? "h-36 sm:h-44" : size === "md" ? "h-24 sm:h-28" : "h-20 sm:h-24";
  const logoCap =
    size === "lg" ? "max-h-16 sm:max-h-20" : size === "md" ? "max-h-11 sm:max-h-14" : "max-h-9";
  const nameSize = size === "lg" ? "text-xl sm:text-2xl" : size === "md" ? "text-base" : "text-sm";

  const body = (
    <>
      <div className={`grid w-full ${frame} place-items-center px-6`}>
        {sponsor.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sponsor.logo_url}
            alt={`${sponsor.name} logo`}
            className={`${logoCap} w-auto max-w-full object-contain opacity-75 transition duration-300 [filter:grayscale(1)_contrast(1.05)] group-hover:opacity-100 group-hover:[filter:grayscale(0)]`}
            loading="lazy"
          />
        ) : (
          <span
            className={`font-display font-semibold uppercase leading-tight tracking-tight text-bone/80 ${nameSize}`}
          >
            {sponsor.name}
          </span>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3">
        <span className="truncate font-mono text-[9px] uppercase tracking-[0.2em] text-ash">
          {sponsor.name}
        </span>
        <span className="h-1 w-1 shrink-0 bg-flare-500/70" aria-hidden="true" />
      </div>
    </>
  );

  const shell = "group mtt-surface mtt-surface-notch mtt-surface-hover flex h-full flex-col overflow-hidden";

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
