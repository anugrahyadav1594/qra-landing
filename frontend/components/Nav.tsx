"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/Logo";
import { NAV_LINKS } from "@/lib/constants";

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

  function isActive(href: string): boolean {
    const path = href.split("#")[0];
    if (href.includes("#") || path === "/") return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-white/10 bg-ink-950/90 backdrop-blur-xl"
          : "border-white/5 bg-ink-950/60 backdrop-blur-md"
      }`}
    >
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="Quantrelic Analytics — home" className="flex items-center gap-3">
          <Logo className="h-7 w-auto object-contain" />
          <span className="font-display text-base font-semibold tracking-tight text-paper">
            Quantrelic
          </span>
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
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

        <div className="hidden lg:block">
          <Link
            href="/waitlist"
            className="rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-white"
          >
            Join the waitlist
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-paper-dim lg:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/5 px-6 py-4 lg:hidden">
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
              href="/waitlist"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-paper px-4 py-2 text-center text-sm font-semibold text-ink-950"
            >
              Join the waitlist
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
