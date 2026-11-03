"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { AccountMenu } from "@/components/auth/AccountMenu";
import { Logo } from "@/components/Logo";
import { NAV_LINKS } from "@/lib/constants";
import { TOURNAMENT_SHORT_NAME } from "@/lib/tournament";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function isActive(href: string): boolean {
    const path = href.split("#")[0];
    if (href.includes("#") || path === "/") return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  const onTournament = pathname.startsWith("/tournament");

  // The tournament and admin surfaces ship their own navigation.
  if (pathname.startsWith("/tournament") || pathname.startsWith("/admin")) return null;

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-white/10 bg-ink-950/90 backdrop-blur-xl"
          : "border-white/5 bg-ink-950/60 backdrop-blur-md"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Quantrelic Analytics — home" className="flex shrink-0 items-center gap-3">
          <Logo className="h-7 w-auto object-contain" />
          <span className="hidden font-display text-base font-semibold tracking-tight text-paper sm:inline">
            Quantrelic
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition ${
                  active ? "font-semibold text-paper" : "text-paper-dim/70 hover:text-paper"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/tournament"
            aria-current={onTournament ? "page" : undefined}
            className={`group flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-tight transition ${
              onTournament
                ? "border-flare-500/60 bg-flare-500/10 text-flare-300"
                : "border-flare-500/40 text-flare-300 hover:border-flare-500 hover:bg-flare-500/10"
            }`}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-flare-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-flare-500" />
            </span>
            {TOURNAMENT_SHORT_NAME}
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-flare-300/70">
              Trading Tournament
            </span>
          </Link>
          <Link
            href="/waitlist"
            className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-paper transition hover:border-white/30 hover:bg-white/5"
          >
            Join the waitlist
          </Link>
          <AccountMenu />
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-paper-dim lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-4 py-4 sm:px-6 lg:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-paper-dim hover:text-paper"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/tournament"
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-between rounded-xl border border-flare-500/40 bg-flare-500/10 px-4 py-3 text-sm font-semibold text-flare-300"
            >
              <span>{TOURNAMENT_SHORT_NAME} — Mumbai Trading Tournament</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/waitlist"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/15 px-4 py-2 text-center text-sm font-semibold text-paper"
            >
              Join the waitlist
            </Link>
            <div className="mt-1 flex items-center">
              <AccountMenu />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
