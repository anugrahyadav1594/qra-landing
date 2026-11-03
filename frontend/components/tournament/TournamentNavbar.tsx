"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AccountMenu } from "@/components/auth/AccountMenu";
import { Logo } from "@/components/Logo";

export const TOURNAMENT_LINKS = [
  { href: "/tournament", label: "Overview" },
  { href: "/tournament#competition", label: "The Competition" },
  { href: "/tournament#prize-pool", label: "Prize Pool" },
  { href: "/tournament#colleges", label: "Participating Colleges" },
  { href: "/tournament#sponsors", label: "Sponsors" },
  { href: "/tournament#event-details", label: "Event Details" },
  { href: "/tournament/rules", label: "Rules" },
  { href: "/tournament/faq", label: "FAQ" },
];

export function TournamentNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  function isActive(href: string) {
    if (href.includes("#")) return false;
    if (href === "/tournament") return pathname === "/tournament";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-white/10 bg-arena-950/92 backdrop-blur-xl" : "border-white/5 bg-arena-950/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/tournament" className="flex shrink-0 items-center gap-3">
          <span className="relative grid h-9 w-9 place-items-center">
            <span className="absolute inset-0 rounded-full border border-flare-500/50" />
            <span className="absolute inset-[3px] rounded-full border border-flare-500/25" />
            <span className="font-display text-[13px] font-bold tracking-tight text-flare-300">MTT</span>
          </span>
          <span className="hidden font-display text-sm font-semibold uppercase tracking-[0.16em] text-bone sm:block">
            Mumbai Trading Tournament
          </span>
        </Link>

        <nav aria-label="Tournament" className="hidden items-center gap-1 xl:flex">
          {TOURNAMENT_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`arena-focus rounded-full px-3 py-1.5 text-[13px] transition ${
                  active ? "bg-flare-500/12 text-flare-300" : "text-ash hover:bg-white/5 hover:text-bone"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/tournament"
            className="hidden font-mono text-[10px] uppercase tracking-[0.26em] text-ash/70 transition hover:text-bone lg:block"
          >
            Powered by Quant Relic
          </Link>
          <Link
            href="/tournament/register"
            className="btn-flare arena-focus rounded-full px-4 py-2 text-[13px] sm:px-5"
          >
            Register now
          </Link>
          <div className="hidden sm:block">
            <AccountMenu />
          </div>
          <button
            type="button"
            className="arena-focus rounded-lg border border-white/10 p-2 text-ash xl:hidden"
            aria-expanded={open}
            aria-label={open ? "Close tournament menu" : "Open tournament menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/5 px-4 py-4 xl:hidden">
          <div className="flex flex-col">
            {TOURNAMENT_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-white/5 py-3 text-sm text-bone/85 last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex items-center justify-between gap-3">
              <AccountMenu />
              <Link
                href="/"
                className="text-xs text-ash underline underline-offset-4"
              >
                Quant Relic home
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
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
