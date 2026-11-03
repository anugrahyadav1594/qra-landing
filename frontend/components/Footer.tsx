import Link from "next/link";

import { Logo } from "@/components/Logo";
import {
  COMPANY_NAME,
  FOOTER_COLUMNS,
  FOOTER_TAGLINE,
  NOT_ADVICE_NOTE,
  PRODUCT_NAME,
  SITE_SHORT_NAME,
} from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink-900">
      <div className="mx-auto max-w-shell px-5 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Logo className="h-6 w-auto object-contain" />
              <span className="flex items-baseline gap-2">
                <span className="font-display text-sm font-semibold uppercase tracking-[0.12em] text-paper">
                  {SITE_SHORT_NAME}
                </span>
                <span className="text-[0.68rem] font-medium uppercase tracking-[0.18em] text-paper-faint">
                  QRA
                </span>
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-paper-dim">{FOOTER_TAGLINE}</p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} title={column.title} links={column.links} />
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-xs text-paper-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {COMPANY_NAME}.
          </p>
          <p className="sm:text-right">
            {PRODUCT_NAME} explains. You decide. {NOT_ADVICE_NOTE}
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
      <p className="micro">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-paper-dim transition-colors hover:text-paper"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
