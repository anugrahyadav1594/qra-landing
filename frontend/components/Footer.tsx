import Link from "next/link";

import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm font-bold text-white">{SITE_NAME}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500">
              Privacy-first products, one identity. Built in India, for everyone.
            </p>
          </div>
          <FooterColumn
            title="Company"
            links={[
              { href: "/about", label: "About" },
              { href: "/team", label: "Team" },
              { href: "/careers", label: "Careers" },
              { href: "/updates", label: "Updates" },
            ]}
          />
          <FooterColumn
            title="Product"
            links={[
              { href: "/products", label: "Products" },
              { href: "/waitlist", label: "Join the waitlist" },
              { href: "/feedback", label: "Feedback" },
              { href: "/contact", label: "Contact" },
            ]}
          />
          <FooterColumn
            title="Legal & trust"
            links={[
              { href: "/privacy", label: "Privacy policy" },
              { href: "/terms", label: "Terms of service" },
              { href: "/security", label: "Security" },
              { href: "/security.txt", label: "security.txt" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/5 pt-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p>grievance@company.com · security@company.com (placeholders — replace before launch)</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-zinc-400 hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
