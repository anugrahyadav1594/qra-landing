"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/Logo";
import { ScrollProgress } from "@/components/ScrollProgress";
import { scrollToSection, useActiveSection } from "@/components/useActiveSection";
import { clerkEnabled } from "@/lib/clerk";
import { HOME_SECTIONS, NAV_LINKS, SECONDARY_LINKS, SITE_SHORT_NAME } from "@/lib/constants";

const HOME_SECTION_IDS = HOME_SECTIONS;

/** Sticky dark navbar with a sliding active indicator and a full-screen menu. */
export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const activeSection = useActiveSection(pathname === "/" ? HOME_SECTION_IDS : []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = useCallback(
    (href: string, sectionId?: string) => {
      if (sectionId) return pathname === "/" && activeSection === sectionId;
      const path = href.split("#")[0];
      if (!path || path === "/" || href.includes("#")) return false;
      return pathname === path || pathname.startsWith(`${path}/`);
    },
    [pathname, activeSection],
  );

  /** Position the underline under the active link (slides on change). */
  useLayoutEffect(() => {
    const container = listRef.current;
    if (!container) return;

    const sync = () => {
      const activeLink = NAV_LINKS.find((link) => isActive(link.href, link.sectionId));
      const element = activeLink ? linkRefs.current[activeLink.href] : null;
      if (!element) {
        setIndicator(null);
        return;
      }
      setIndicator({ left: element.offsetLeft, width: element.offsetWidth });
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [isActive]);

  // Close the menu on navigation; lock scroll while it is open.
  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  /** Same-page section links scroll smoothly; other links navigate normally. */
  function handleSectionNav(event: React.MouseEvent<HTMLAnchorElement>, sectionId?: string) {
    if (!sectionId || pathname !== "/") return;
    event.preventDefault();
    scrollToSection(sectionId);
    setMenuOpen(false);
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? "border-line bg-ink-950/85" : "border-transparent bg-ink-950/60"
        }`}
      >
        <nav
          aria-label="Main"
          className={`mx-auto flex max-w-shell items-center gap-4 px-5 transition-[height] duration-300 ease-editorial sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-6 ${
            scrolled ? "h-[68px]" : "h-[68px] lg:h-20"
          }`}
        >
          <Link
            href="/"
            aria-label="Quantrelic Analytics — home"
            data-nav-logo
            className="nav-seq flex items-center gap-2.5"
            style={{ "--d": "0ms" } as React.CSSProperties}
            onClick={() => setMenuOpen(false)}
          >
            <Logo className="h-6 w-auto object-contain" />
            <span className="flex items-baseline gap-2">
              <span className="font-display text-base font-semibold tracking-tight text-paper">
                {SITE_SHORT_NAME}
              </span>
              <span className="hidden text-[0.68rem] font-medium uppercase tracking-[0.18em] text-paper-faint sm:inline">
                QRA
              </span>
            </span>
          </Link>

          <div
            ref={listRef}
            data-nav-links
            className="nav-seq relative hidden items-center justify-self-center lg:flex"
            style={{ "--d": "90ms" } as React.CSSProperties}
          >
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href, link.sectionId);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  ref={(element) => {
                    linkRefs.current[link.href] = element;
                  }}
                  onClick={(event) => handleSectionNav(event, link.sectionId)}
                  aria-current={active ? (link.sectionId ? "true" : "page") : undefined}
                  className={`px-3 py-2 text-sm transition-colors duration-300 ${
                    active ? "text-paper" : "text-paper-dim hover:text-paper"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <span
              aria-hidden="true"
              className="nav-indicator absolute -bottom-px left-0 h-px bg-brand-500"
              style={{
                width: indicator ? `${indicator.width - 24}px` : 0,
                transform: `translateX(${indicator ? indicator.left + 12 : 0}px)`,
                opacity: indicator ? 1 : 0,
              }}
            />
          </div>

          <div className="ml-auto flex items-center gap-3 lg:ml-0 lg:justify-self-end">
            {clerkEnabled && (
              <div className="hidden items-center gap-4 lg:flex">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="text-sm text-paper-dim transition-colors hover:text-paper"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
              </div>
            )}

            <Link
              href="/waitlist"
              className="nav-seq hidden rounded-md bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 ease-editorial hover:-translate-y-0.5 hover:bg-brand-600 sm:inline-flex"
              style={{ "--d": "170ms" } as React.CSSProperties}
            >
              Get early access
            </Link>

            <button
              type="button"
              className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-paper transition-colors hover:bg-ink-800 lg:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((value) => !value)}
            >
              <span className="relative block h-3.5 w-5" aria-hidden="true">
                <span
                  className={`absolute left-0 block h-px w-5 bg-current transition-transform duration-300 ease-editorial ${
                    menuOpen ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-px w-5 bg-current transition-opacity duration-200 ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-px w-5 bg-current transition-transform duration-300 ease-editorial ${
                    menuOpen ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </nav>

        <ScrollProgress />
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="mobile-menu"
        hidden={!menuOpen}
        className={`fixed inset-0 z-40 lg:hidden ${scrolled ? "top-[68px]" : "top-[68px] lg:top-20"} ${
          menuOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto bg-ink-950/[0.985] px-5 pb-10 pt-8 sm:px-6">
          <div className="space-y-1">
            {[...NAV_LINKS, ...SECONDARY_LINKS].map((link, index) => {
              const active = isActive(link.href, link.sectionId);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(event) => handleSectionNav(event, link.sectionId)}
                  className={`block border-b border-line-faint py-4 font-display text-2xl font-semibold tracking-tight transition-colors ${
                    active ? "text-brand-400" : "text-paper hover:text-brand-300"
                  }`}
                  style={{
                    animation: menuOpen
                      ? `rise-in 0.45s cubic-bezier(0.16,1,0.3,1) both ${index * 45}ms`
                      : undefined,
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-10 space-y-4">
            {clerkEnabled && (
              <div className="flex items-center gap-5">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button type="button" className="text-base text-paper-dim">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button type="button" className="text-base text-paper-dim">
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
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center justify-center rounded-md bg-brand-500 px-5 py-3.5 text-base font-semibold text-white"
            >
              Get early access
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
