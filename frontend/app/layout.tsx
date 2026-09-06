import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";

// Self-hosted variable fonts — offline-safe, no runtime font fetches.
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";

import "./globals.css";

const DEFAULT_TITLE = `${SITE_NAME} — QRA: AI-Powered Financial Research`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    images: [{ url: "/image.png", width: 512, height: 512, alt: "Quantrelic QRA logo" }],
  },
  twitter: { card: "summary", title: DEFAULT_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
