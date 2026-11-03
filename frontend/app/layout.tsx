import type { Metadata, Viewport } from "next";

import { AuthProvider } from "@/components/AuthProvider";
import { Cursor } from "@/components/motion/Cursor";
import { Footer } from "@/components/Footer";
import { INTRO_BOOTSTRAP, QRALoader } from "@/components/motion/QRALoader";
import { Nav } from "@/components/Nav";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";

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
  ...socialMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION }),
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
        {/* Runs before the rest of the body is parsed: decides whether the
            opening sequence plays, and delays the hero by the same amount. */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOTSTRAP }} />

        <QRALoader />
        <Cursor />

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
