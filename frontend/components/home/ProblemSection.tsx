"use client";

import { useEffect, useRef, useState } from "react";

import { QRADataField } from "@/components/motion/QRADataField";
import { QRAAtmosphere } from "@/components/motion/QRAAtmosphere";
import { QRASectionTransition } from "@/components/motion/QRASectionTransition";
import { Section, SectionLabel, SectionStatement } from "@/components/ui";
import { useScrollScene } from "@/components/motion/useScrollScene";
import { PROBLEM } from "@/lib/content";

/**
 * The problem — the site's signature sequence.
 *
 * Seven sources of financial information are scattered across the stage. As the
 * section is scrolled they drift, overlap and pile up until the information is
 * unreadable, everything stops, two statements land, and then the whole field
 * converges on a single node.
 *
 * Everything readable is HTML; the field behind it is canvas. The animation is
 * built with `gsap.from()`, which means the authored markup is the *finished*
 * state: with reduced motion, without JavaScript, or before the scene loads,
 * the section simply reads as a tidy summary.
 *
 * The scroll length lives on the wrapper rather than on the section, because a
 * pinned box can only travel inside a parent taller than itself, and the
 * section's own container is exactly content-height. Pinning is desktop-only:
 * on small screens the sequence plays out as the page scrolls instead.
 */
export function ProblemSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // The stage is only tall enough to choreograph once we know we can.
    setActive(true);
  }, []);

  useScrollScene(
    ref,
    ({ gsap }) => {
      const scope = ref.current;
      if (!scope) return;

      const fragments = scope.querySelectorAll("[data-fragment]");
      // The pinned box is the wrapper's first child; the sequence is timed to
      // end exactly where the pin releases, so the resolved composition is what
      // stays on screen. Below lg nothing is pinned, so the scene plays out over
      // the section's own travel instead.
      const pinned = scope.firstElementChild as HTMLElement | null;
      const tall = window.matchMedia("(min-width: 1024px)").matches && pinned !== null;
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: tall
          ? {
              trigger: scope,
              start: "top 80px",
              end: () => `+=${Math.max(1, scope.offsetHeight - (pinned?.offsetHeight ?? 0))}`,
              scrub: 0.6,
            }
          : {
              trigger: scope,
              start: "top 80%",
              end: "bottom 45%",
              scrub: 0.6,
            },
      });

      // 1 — the seven sources arrive, in order, slowly. Nothing flies in: the
      //     pile is legible here, which is what makes this a statement about
      //     volume rather than a decorative mess.
      timeline.from(fragments, {
        opacity: 0,
        y: 24,
        scale: 0.985,
        duration: 0.9,
        stagger: { each: 0.09, from: "start" },
      });

      // 2 — they begin to overlap as the page moves past them.
      timeline.to(
        fragments,
        {
          x: () => gsap.utils.random(-34, 34),
          y: () => gsap.utils.random(-18, 18),
          rotate: () => gsap.utils.random(-3, 3),
          duration: 1.1,
          stagger: { each: 0.03, from: "start" },
        },
        ">-0.2",
      );

      // 3 — density. The gaps close and the pile stops being readable: still
      //     the same seven sources, just too many of them in one place.
      timeline.to(fragments, {
        x: 0,
        y: 0,
        rotate: 0,
        scale: 0.97,
        borderColor: "rgba(245,247,250,0.24)",
        duration: 1,
        stagger: { each: 0.02, from: "end" },
      });

      // 4 — everything stops. A deliberate hold, so the freeze registers.
      timeline.to({}, { duration: 0.6 });
      timeline.fromTo("[data-overload]", { opacity: 0 }, { opacity: 1, duration: 0.7 });
      timeline.to({}, { duration: 0.8 });
      timeline.to("[data-overload]", { opacity: 0, duration: 0.5 });
      timeline.fromTo("[data-clarity]", { opacity: 0 }, { opacity: 1, duration: 0.7 });

      // 5 — the pause. Negative space is part of the argument, so it gets real
      //     time on the timeline: the frame goes almost empty first.
      timeline.to({}, { duration: 1 });
      timeline.to(fragments, { opacity: 0.1, duration: 0.9 });

      // 6 — everything converges on one node
      timeline.to(
        fragments,
        {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 0.82,
          opacity: 0.22,
          duration: 1.3,
          stagger: { each: 0.03, from: "edges" },
        },
        ">-0.3",
      );
      timeline.fromTo(
        "[data-node]",
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.9 },
        ">-0.7",
      );
      timeline.to("[data-clarity]", { opacity: 0.35, duration: 0.6 }, "<");
    },
    [active],
  );

  return (
    <Section id="problem" tone="raised" labelledBy="problem-heading" className="relative overflow-x-clip">
      <QRASectionTransition label="Fragmented" />

      {/* The environment: the pile, felt rather than seen. */}
      <QRAAtmosphere variant="problem" />

      {/* The field behaves the same way the fragments do: chaos, then order. */}
      <QRADataField variant="converge" intensity={0.85} density={1.2} stickyCanvas className="opacity-80" />

      <div ref={ref} className={`relative z-10 ${active ? "lg:min-h-[190vh]" : ""}`}>
        <div className={active ? "lg:sticky lg:top-20" : ""}>
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
            <div>
              <SectionLabel tone="brand">{PROBLEM.label}</SectionLabel>
              <SectionStatement id="problem-heading" lines={PROBLEM.statement} as="h2" className="mt-5" />
              <p className="mt-6 max-w-md text-base leading-relaxed text-paper-dim">{PROBLEM.note}</p>

              {/* The two statements land inside the animation. */}
              <div className="mt-10 space-y-2">
                <p
                  data-overload
                  className="font-display text-xl font-semibold tracking-tight text-paper sm:text-2xl"
                >
                  {PROBLEM.overload}
                </p>
                <p
                  data-clarity
                  className="font-display text-xl font-semibold tracking-tight text-brand-300 sm:text-2xl"
                >
                  {PROBLEM.clarity}
                </p>
              </div>
            </div>

            {/* The fragment field. Authored as an orderly grid — the animation
                scatters it and brings it back. */}
            <div className="relative overflow-x-clip">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
                {PROBLEM.fragments.map((fragment, index) => (
                  <div
                    key={fragment.label}
                    data-fragment
                    className="card-edge rounded-md border border-line bg-ink-850/85 px-3 py-3 backdrop-blur-sm"
                  >
                    <span className="micro !tracking-[0.14em] !text-paper-faint">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-2 text-xs leading-snug text-paper-dim sm:text-sm">{fragment.label}</p>
                  </div>
                ))}
              </div>

              {/* Where it all resolves. */}
              <div className="mt-12 flex flex-col items-center">
                <span aria-hidden="true" className="h-10 w-px bg-brand-500/40" />
                <div data-node className="flex flex-col items-center gap-3">
                  <span className="rounded-md border border-brand-500/40 bg-brand-500/[0.08] px-4 py-2 font-display text-sm font-semibold tracking-[0.08em] text-paper">
                    QRA
                  </span>
                  <span aria-hidden="true" className="h-6 w-px bg-line-strong" />
                  <span className="micro !tracking-[0.24em] !text-brand-400">Understand</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
