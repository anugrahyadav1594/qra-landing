"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AccountMenu } from "@/components/auth/AccountMenu";
import { Logo } from "@/components/Logo";
import { loadGsap, prefersReducedMotion, useIsomorphicLayoutEffect } from "@/lib/gsap";

export const TOURNAMENT_LINKS = [
  { href: "/tournament", label: "Overview" },
  { href: "/tournament#competition", label: "The Competition" },
  { href: "/tournament#prize-pool", label: "Prize Pool" },
  { href: "/tournament#colleges", label: "Participating Colleges" },
  { href: "/tournament#sponsors", label: "Sponsors" },
  { href: "/tournament#event-details", label: "Event Details" },
  { href: "/tournament/rules", label: "Rules" },
  { href: "/tournament/faq", label: "FAQ" },
] as const;

/** Sections observed for the active indicator (anchor links only). */
const SECTION_IDS = ["competition", "prize-pool", "colleges", "sponsors", "event-details"] as const;

/** Nav height in px — default and compact (scrolled) states. */
const NAV_HEIGHT = { base: 80, scrolled: 66 };

/** Base width of the shared indicator; scaleX maps it to the active link. */
const INDICATOR_BASE = 100;

/**
 * MTT COMMAND BAR
 *
 * The persistent identity of the tournament: a fixed bar with a reserved
 * spacer (so the compact scrolled state never shifts the page), a measured
 * link row that degrades to the overlay menu before it can wrap, a shared
 * active-section indicator driven by IntersectionObserver, and a single
 * GSAP entrance timeline. No scroll-linked React state — the scrolled state
 * toggles one data attribute.
 */
export function TournamentNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("/tournament");
  const [density, setDensity] = useState<"comfortable" | "compact" | "tight">("comfortable");
  const [useMenu, setUseMenu] = useState(false);

  const headerRef = useRef<HTMLElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const menuLinksRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef(false);

  const onTournamentHome = pathname === "/tournament";

  useEffect(() => setOpen(false), [pathname]);

  /* ── Scrolled state: one passive listener, one boolean ─────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── Active section (IntersectionObserver, not a scroll handler) ───── */
  useEffect(() => {
    if (!onTournamentHome) {
      const match = TOURNAMENT_LINKS.find(
        (link) => link.href !== "/tournament" && !link.href.includes("#") && link.href === pathname,
      );
      setActiveHref(match ? match.href : pathname);
      return;
    }

    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") {
      setActiveHref("/tournament");
      return;
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        if (window.scrollY < 120) {
          setActiveHref("/tournament");
          return;
        }
        const current = SECTION_IDS.find((id) => visible.has(id));
        if (current) setActiveHref(`/tournament#${current}`);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [onTournamentHome, pathname]);

  /* ── Anchor navigation: smooth scroll + history support ────────────── */
  const scrollToHash = useCallback((hash: string, smooth = true) => {
    const element = document.getElementById(hash);
    if (!element) return false;
    element.scrollIntoView({
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
      block: "start",
    });
    return true;
  }, []);

  useEffect(() => {
    const onHistoryChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) scrollToHash(hash, false);
    };
    window.addEventListener("popstate", onHistoryChange);
    window.addEventListener("hashchange", onHistoryChange);
    return () => {
      window.removeEventListener("popstate", onHistoryChange);
      window.removeEventListener("hashchange", onHistoryChange);
    };
  }, [scrollToHash]);

  const handleNavigate = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const [path, hash] = href.split("#");
    setOpen(false);
    if (!hash) return;
    if (path && path !== pathname) return; // let the router navigate
    const target = document.getElementById(hash);
    if (!target) return;
    event.preventDefault();
    setActiveHref(href);
    scrollToHash(hash);
    window.history.pushState(null, "", href);
  };

  /* ── Fit measurement: reduce density, then fall back to the menu ───── */
  useIsomorphicLayoutEffect(() => {
    const bar = barRef.current;
    const nav = navRef.current;
    if (!bar || !nav) return;

    const measure = () => {
      // Below lg the overlay menu is the intended pattern — never measure.
      const desktop = window.matchMedia?.("(min-width: 1024px)").matches ?? true;
      if (!desktop) {
        setUseMenu(true);
        return;
      }
      const links = Array.from(nav.querySelectorAll<HTMLElement>("[data-nav-link]"));
      if (links.length === 0) return;
      const barWidth = bar.clientWidth;
      if (barWidth === 0) return; // hidden / jsdom
      const brandWidth = bar.querySelector<HTMLElement>("[data-nav-brand]")?.offsetWidth ?? 0;
      const actionsWidth = bar.querySelector<HTMLElement>("[data-nav-actions]")?.offsetWidth ?? 0;
      const available = barWidth - brandWidth - actionsWidth - 72;

      const tiers: Array<"comfortable" | "compact" | "tight"> = ["comfortable", "compact", "tight"];
      for (const tier of tiers) {
        // The data attribute drives the density CSS, so widths really change.
        nav.dataset.density = tier;
        const needed = links.reduce((sum, link) => sum + link.offsetWidth, 0);
        if (needed <= available) {
          setDensity(tier);
          setUseMenu(false);
          return;
        }
      }
      setDensity("comfortable");
      setUseMenu(true);
    };

    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(bar);
    return () => observer.disconnect();
  }, []);

  /* ── Entrance + indicator motion (GSAP) ────────────────────────────── */
  useIsomorphicLayoutEffect(() => {
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    loadGsap().then((mod) => {
      if (!mod || cancelled || !headerRef.current) return;
      const { gsap } = mod;
      ctx = gsap.context(() => {
        if (prefersReducedMotion()) {
          gsap.set("[data-nav-anim]", { opacity: 1, y: 0, scale: 1 });
          readyRef.current = true;
          return;
        }
        const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        timeline
          .fromTo("[data-nav-anim='bar']", { opacity: 0 }, { opacity: 1, duration: 0.5 })
          .fromTo(
            "[data-nav-anim='emblem']",
            { opacity: 0, scale: 0.92 },
            { opacity: 1, scale: 1, duration: 0.55 },
            0.05,
          )
          .fromTo(
            "[data-nav-anim='wordmark']",
            { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.5 },
            0.12,
          )
          .fromTo(
            "[data-nav-anim='link']",
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.045 },
            0.2,
          )
          .fromTo(
            "[data-nav-anim='powered']",
            { opacity: 0 },
            { opacity: 1, duration: 0.4 },
            0.34,
          )
          .fromTo(
            "[data-nav-anim='cta']",
            { opacity: 0, y: 8, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5 },
            0.38,
          )
          .fromTo(
            "[data-nav-anim='signin']",
            { opacity: 0 },
            { opacity: 1, duration: 0.4 },
            0.46,
          );
        readyRef.current = true;
      }, headerRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  /* ── Shared indicator: transform-only, moved on active change ──────── */
  useIsomorphicLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const apply = (x: number, width: number) => {
      indicator.style.transform = `translateX(${x}px) scaleX(${width / INDICATOR_BASE})`;
    };

    const move = (animate: boolean) => {
      const link = nav.querySelector<HTMLElement>(`[data-nav-link][data-href="${activeHref}"]`);
      if (!link) {
        indicator.style.opacity = "0";
        return;
      }
      indicator.style.opacity = "1";
      const x = link.offsetLeft;
      const width = link.offsetWidth;
      if (!animate) {
        apply(x, width);
        return;
      }
      loadGsap().then((mod) => {
        if (!mod) return apply(x, width);
        mod.gsap.to(indicator, {
          x,
          scaleX: width / INDICATOR_BASE,
          duration: prefersReducedMotion() ? 0 : 0.42,
          ease: "power3.out",
          overwrite: true,
        });
      });
    };

    move(readyRef.current && !prefersReducedMotion());
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => move(false));
    observer.observe(nav);
    return () => observer.disconnect();
  }, [activeHref, density, useMenu]);

  /* ── Mobile menu: escape, focus, scroll lock, animated panel ───────── */
  useEffect(() => {
    if (!open) return;
    // Move keyboard focus into the panel so Escape and Tab behave as expected.
    menuLinksRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useIsomorphicLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    loadGsap().then((mod) => {
      if (!mod || cancelled || !panelRef.current) return;
      const { gsap } = mod;
      ctx = gsap.context(() => {
        if (prefersReducedMotion()) return;
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(panelRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.32 })
          .fromTo(
            menuLinksRef.current?.children ?? [],
            { opacity: 0, x: -14 },
            { opacity: 1, x: 0, duration: 0.34, stagger: 0.045 },
            0.08,
          );
      }, panelRef);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [open]);

  const linkClass = useMemo(
    () =>
      [
        "mtt-navlink relative flex items-center whitespace-nowrap font-mono uppercase tracking-[0.16em] transition-colors duration-200",
        density === "tight"
          ? "px-1.5 text-[10px] tracking-[0.1em]"
          : density === "compact"
            ? "px-2 text-[11px] tracking-[0.12em]"
            : "px-2.5 text-[11.5px]",
      ].join(" "),
    [density],
  );

  return (
    <>
      {/* Reserved space: the bar is fixed, so the compact state never shifts content */}
      <div style={{ height: NAV_HEIGHT.base }} aria-hidden="true" />

      <header
        ref={headerRef}
        data-nav-anim="bar"
        className="fixed inset-x-0 top-0 z-50 mtt-nav"
        data-scrolled={scrolled ? "true" : "false"}
      >
        <div
          className="mtt-nav-surface absolute inset-0 border-b transition-all duration-300 ease-out"
          data-scrolled={scrolled ? "true" : "false"}
        />
        <div
          ref={barRef}
          className="relative mx-auto flex w-full max-w-[1600px] items-center gap-3 px-4 transition-[height] duration-300 ease-out sm:px-6 xl:gap-5"
          style={{ height: scrolled ? NAV_HEIGHT.scrolled : NAV_HEIGHT.base }}
        >
          {/* ── Brand ───────────────────────────────────────────────── */}
          <div data-nav-brand className="flex min-w-0 items-center gap-3">
            <Link
              href="/tournament"
              data-nav-anim="emblem"
              className="mtt-emblem group arena-focus"
              aria-label="Mumbai Trading Tournament — home"
            >
              <span className="mtt-emblem-ring" aria-hidden="true" />
              <span className="mtt-emblem-text" aria-hidden="true">
                MTT
              </span>
            </Link>
            <div data-nav-anim="wordmark" className="min-w-0">
              <Link href="/tournament" className="mtt-wordmark arena-focus block">
                <span className="block truncate">Mumbai Trading</span>
                <span className="block truncate">Tournament</span>
              </Link>
              <span className="mtt-coord hidden lg:block">MTT / Season 01</span>
            </div>
            <span className="mtt-nav-divider hidden xl:block" aria-hidden="true" />
          </div>

          {/* ── Links ───────────────────────────────────────────────── */}
          <div
            ref={navRef}
            data-density={density}
            aria-hidden={useMenu || undefined}
            className={`mtt-navlinks relative hidden items-center justify-center lg:flex ${
              useMenu ? "mtt-navlinks-measure" : "flex-1"
            }`}
          >
              {TOURNAMENT_LINKS.map((link) => {
                const active = link.href === activeHref;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-nav-link
                    data-href={link.href}
                    data-nav-anim="link"
                    data-active={active ? "true" : "false"}
                    aria-current={active ? "page" : undefined}
                    onClick={(event) => handleNavigate(event, link.href)}
                    className={`${linkClass} ${active ? "is-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            <span ref={indicatorRef} className="mtt-nav-indicator" aria-hidden="true" />
          </div>
          {useMenu && <div className="flex-1" />}

          {/* ── Actions ─────────────────────────────────────────────── */}
          <div data-nav-actions className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span
              data-nav-anim="powered"
              className="mtt-coord hidden items-center gap-2 2xl:flex"
            >
              <Logo className="h-4 w-auto object-contain opacity-60" />
              Powered by Quant Relic
            </span>

            <div data-nav-anim="cta" className="mtt-cta-wrap">
              <Link href="/tournament/register" className="mtt-cta arena-focus">
                <span className="mtt-cta-sweep" aria-hidden="true" />
                <span className="relative">Register now</span>
                <svg
                  className="mtt-cta-arrow relative"
                  viewBox="0 0 16 16"
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <path d="M2 8h11M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>

            <div data-nav-anim="signin" className="mtt-signin hidden sm:block">
              <AccountMenu />
            </div>

            <button
              ref={toggleRef}
              type="button"
              className={`mtt-burger arena-focus ${useMenu ? "" : "lg:hidden"}`}
              aria-expanded={open}
              aria-controls="mtt-mobile-menu"
              aria-label={open ? "Close tournament menu" : "Open tournament menu"}
              onClick={() => setOpen((value) => !value)}
            >
              <span className="mtt-burger-line" data-open={open || undefined} />
              <span className="mtt-burger-line" data-open={open || undefined} />
              <span className="mtt-burger-line" data-open={open || undefined} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Overlay menu (tablet / mobile, and any width that needs it) ── */}
      {open && (
        <div
          id="mtt-mobile-menu"
          ref={panelRef}
          className={`mtt-menu fixed inset-0 z-40 ${useMenu ? "" : "lg:hidden"}`}
          role="dialog"
          aria-modal="true"
          aria-label="Tournament navigation"
        >
          <div className="mtt-menu-grid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 70% at 50% 0%, rgba(255,121,47,0.10), transparent 60%)",
            }}
            aria-hidden="true"
          />
          <div
            className="relative flex h-full flex-col overflow-y-auto px-4 pb-10 sm:px-6"
            style={{ paddingTop: NAV_HEIGHT.scrolled + 16 }}
          >
            <div className="mtt-coord mb-6">Navigation · MTT</div>
            <div ref={menuLinksRef} className="flex flex-col">
              {TOURNAMENT_LINKS.map((link, index) => {
                const active = link.href === activeHref;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-active={active ? "true" : "false"}
                    aria-current={active ? "page" : undefined}
                    onClick={(event) => handleNavigate(event, link.href)}
                    className="mtt-menu-link group"
                  >
                    <span className="mtt-figure font-mono text-[10px] text-flare-500/80">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">{link.label}</span>
                    <span className="mtt-menu-arrow" aria-hidden="true">
                      →
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="mtt-signin w-full">
                <AccountMenu />
              </div>
              <Link href="/" className="mtt-coord hover:text-bone">
                ← Quant Relic home
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Footer strip: closes the page with the same technical language used by
 * the redesigned sections — measurement rule, arena mark, brand line. */
export function TournamentFooterStrip() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.08] bg-arena-950">
      <div className="mtt-ticks opacity-30" aria-hidden="true" />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="relative mt-1 grid h-10 w-10 shrink-0 place-items-center"
            >
              <span className="absolute inset-0 rounded-full border border-flare-500/45" />
              <span className="absolute inset-[4px] rounded-full border border-flare-500/25" />
              <span className="font-display text-[10px] font-bold tracking-tight text-flare-300">
                MTT
              </span>
            </span>
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-bone">
                Quantrelic&apos;s Mumbai Trading Tournament
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Logo className="h-6 w-auto object-contain opacity-70" />
                <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted">
                  Powered by Quant Relic Analytics Private Limited
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:items-end">
            <nav
              aria-label="Tournament footer"
              className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.24em]"
            >
              <Link href="/tournament/rules" className="text-ash transition hover:text-bone">
                Rules
              </Link>
              <Link href="/tournament/faq" className="text-ash transition hover:text-bone">
                FAQ
              </Link>
              <Link href="/tournament/leaderboard" className="text-ash transition hover:text-bone">
                Leaderboard
              </Link>
              <Link href="/privacy" className="text-ash transition hover:text-bone">
                Privacy
              </Link>
              <Link href="/contact" className="text-ash transition hover:text-bone">
                Contact
              </Link>
            </nav>
            <p className="max-w-sm text-[11px] leading-relaxed text-muted lg:text-right">
              An educational trading competition for college students in Mumbai. Trading involves
              risk; nothing here is investment advice.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <span className="mtt-coord">MTT / Mumbai · Individual participation</span>
          <span className="mtt-coord">End of briefing</span>
        </div>
      </div>
    </footer>
  );
}
