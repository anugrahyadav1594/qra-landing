import type { Metadata } from "next";
import Link from "next/link";

import { RegistrationWizard } from "@/components/tournament/RegistrationWizard";
import { ToastProvider } from "@/components/tournament/ui";
import { apiGet } from "@/lib/api";
import { SITE_URL } from "@/lib/constants";
import {
  DEFAULT_TOURNAMENT_CONFIG,
  TOURNAMENT_NAME,
  type College,
  type TournamentConfig,
} from "@/lib/tournament";

export const metadata: Metadata = {
  title: "Register",
  description: `Register individually for ${TOURNAMENT_NAME}. Select your onboarded college, review your entry and receive your registration ID.`,
  alternates: { canonical: `${SITE_URL}/tournament/register` },
  robots: { index: true, follow: true },
};

export const revalidate = 0;

export default async function RegisterPage() {
  const [config, colleges] = await Promise.all([
    apiGet<TournamentConfig>("/api/v1/tournament", DEFAULT_TOURNAMENT_CONFIG),
    apiGet<{ colleges: College[] }>("/api/v1/tournament/colleges", { colleges: [] }),
  ]);

  return (
    <div className="arena-surface arena-grain relative min-h-[70vh] py-14 sm:py-20">
      <div className="arena-technical pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="mb-8">
          <Link
            href="/tournament"
            className="arena-focus rounded font-mono text-[10px] uppercase tracking-[0.24em] text-ash transition hover:text-bone"
          >
            ← Back to the tournament
          </Link>
        </nav>

        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-flare-300">
            {config.participation_type} registration
          </p>
          <h1 className="mt-4 font-display text-3xl font-semibold uppercase leading-[1.02] tracking-tightest text-bone sm:text-5xl">
            Enter the arena.
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ash">
            Four steps: verify your email, tell us who you are, select your onboarded college, and
            review your entry. You compete individually, representing your institution.
          </p>
        </div>

        <ToastProvider>
          <RegistrationWizard
            colleges={colleges.colleges}
            config={config}
            existingRegistration={null}
          />
        </ToastProvider>

        <p className="mt-8 text-xs leading-relaxed text-ash/80">
          Your data is used to run the tournament and nothing else. Marketing consent is optional
          and can be withdrawn at any time — see the{" "}
          <Link href="/privacy" className="arena-focus rounded text-flare-300 underline underline-offset-4">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
