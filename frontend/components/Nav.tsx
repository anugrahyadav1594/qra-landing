"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";
import { scrollToSection, useActiveSection } from "@/components/useActiveSection";
import { clerkEnabled } from "@/lib/clerk";
import { HOME_SECTIONS, NAV_LINKS, SECONDARY_LINKS } from "@/lib/constants";

const HOME_SECTION_IDS = HOME_SECTIONS;

/** Sticky, translucent navbar with homepage scroll-spy and a mobile menu. */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Scroll-spy only applies to the homepage; other routes fall back to
  // normal route-level active states below.
  const activeSection = useActiveSection(pathname === "/" ? HOME_SECTION_IDS : []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route changes and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function isRouteActive(href: string): boolean {
    const path = href.split("#")[0];
    if (!path || path === "/" || href.includes("#")) return false;
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  function isActive(href: string, sectionId?: string): boolean {
    if (sectionId) return pathname === "/" && activeSection === sectionId;
    return isRouteActive(href);
  }

  /** Same-page section links scroll smoothly; cross-page links navigate. */
  function handleSectionNav(event: React.MouseEvent<HTMLAnchorElement>, sectionId?: string) {
    if (!sectionId || pathname !== "/") return;
    event.preventDefault();
    scrollToSection(sectionId);
    setOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur transition-colors duration-200 ${
        scrolled
          ? "border-ink/10 bg-canvas/95 supports-[backdrop-filter]:bg-canvas/80"
          : "border-ink/[0.06] bg-canvas/90 supports-[backdrop-filter]:bg-canvas/70"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-shell items-center gap-4 px-5 sm:px-6 xl:grid xl:h-[68px] xl:grid-cols-[1fr_auto_1fr] xl:gap-6"
      >
        <Link
          href="/"
          aria-label="Quantrelic Analytics — home"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <Logo className="h-6 w-auto object-contain" />
          <span className="font-display text-base font-semibold tracking-tight text-ink">
            Quantrelic
          </span>
        </Link>

        <div className="hidden items-center justify-self-center xl:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, link.sectionId);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(event) => handleSectionNav(event, link.sectionId)}
                aria-current={active ? (link.sectionId ? "true" : "page") : undefined}
                className={`relative px-3 py-2 text-sm transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-0 h-px transition-opacity ${
                    active ? "bg-accent opacity-100" : "opacity-0"
                  }`}
                />
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-4 xl:ml-0 xl:justify-self-end">
          {clerkEnabled && (
            <div className="hidden items-center gap-4 lg:flex">
              <SignedOut>
                <SignInButton mode="modal">
                  <button type="button" className="text-sm text-muted transition-colors hover:text-ink">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button type="button" className="text-sm text-muted transition-colors hover:text-ink">
                    Sign up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          )}

          <Link
            href="/waitlist"
            className="hidden rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-700 sm:inline-flex"
          >
            Join the waitlist
          </Link>

          <button
            type="button"
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-ink transition-colors hover:bg-canvas-sunken xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-ink/10 bg-canvas xl:hidden">
          <div className="mx-auto max-w-shell space-y-1 px-5 py-5 sm:px-6">
            {[...NAV_LINKS, ...SECONDARY_LINKS].map((link) => {
              const active = isActive(link.href, link.sectionId);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleSectionNav(event, link.sectionId)}
                  className={`block rounded-md px-3 py-3 text-base transition-colors ${
                    active ? "bg-white font-medium text-ink" : "text-ink-700 hover:bg-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="mt-5 border-t border-ink/10 pt-5">
              {clerkEnabled && (
                <div className="flex items-center gap-5 px-3">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <button type="button" className="text-base text-muted transition-colors hover:text-ink">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <button type="button" className="text-base text-muted transition-colors hover:text-ink">
                        Sign up
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <UserButton />
                  </SignedIn>
                </div>
              )}
              <Link
                href="/waitlist"
                onClick={() => setOpen(false)}
                className="mt-5 flex w-full items-center justify-center rounded-md bg-accent px-5 py-3.5 text-base font-semibold text-white"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
