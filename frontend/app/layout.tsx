import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/constants";

// Self-hosted variable fonts — offline-safe, no runtime font fetches.
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_IN",
    images: [
      {
        url: "/image.png",
        width: 512,
        height: 512,
        alt: "Quantrelic Analytics logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [{ url: "/image.png", alt: "Quantrelic Analytics logo" }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070A0F",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-ink-950">
        {/* ClerkProvider goes inside <body> — never wraps <html> (Clerk docs). */}
        <AuthProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
