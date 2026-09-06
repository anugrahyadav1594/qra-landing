import Link from "next/link";

import { Logo } from "@/components/Logo";
import { COMPANY_NAME, FOOTER_COLUMNS, FOOTER_TAGLINE, SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-ink-900/40">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <Logo className="h-7 w-auto object-contain" />
              <p className="font-display text-sm font-semibold text-paper">{SITE_NAME}</p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper-dim/60">
              {FOOTER_TAGLINE}
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-paper-dim/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.</p>
          <p>QRA does not provide investment advice. QRA investigates. You decide.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-paper-dim/50">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-paper-dim/70 hover:text-paper">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
