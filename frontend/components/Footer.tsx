import Link from "next/link";

import { Logo } from "@/components/Logo";
import {
  COMPANY_NAME,
  FOOTER_COLUMNS,
  FOOTER_NOTE,
  FOOTER_TAGLINE,
  NOT_ADVICE_NOTE,
  PRODUCT_NAME,
  SITE_NAME,
} from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-canvas-deep">
      <div className="mx-auto max-w-shell px-5 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-auto object-contain" />
              <p className="font-display text-sm font-semibold text-ink">{SITE_NAME}</p>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">{FOOTER_TAGLINE}</p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {PRODUCT_NAME} is a product of {COMPANY_NAME}.
            </p>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-ink/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
          <p className="sm:text-right">
            {FOOTER_NOTE} {NOT_ADVICE_NOTE}
          </p>
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
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-700">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-muted transition-colors hover:text-ink">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
