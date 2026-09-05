"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { NAV_LINKS } from "@/lib/constants";

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/80 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-accent-400 text-sm font-black text-ink-950">
            Q
          </span>
          QRA
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`text-sm transition ${
                  active ? "font-semibold text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="hidden md:block">
          <Link
            href="/waitlist"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-zinc-200"
          >
            Join the waitlist
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg border border-white/10 p-2 text-zinc-300 md:hidden"
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
        <div className="border-t border-white/5 px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-zinc-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/waitlist"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-full bg-white px-4 py-2 text-center text-sm font-semibold text-ink-950"
            >
              Join the waitlist
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
