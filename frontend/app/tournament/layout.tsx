import { TournamentFooterStrip, TournamentNavbar } from "@/components/tournament/TournamentNavbar";

/** The tournament has its own navigation; the corporate Nav steps aside. */
export default function TournamentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-arena-950">
      <a
        href="#main"
        className="sr-only z-[80] focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:rounded-full focus:bg-flare-500 focus:px-5 focus:py-2 focus:text-sm focus:font-semibold focus:text-arena-950"
      >
        Skip to content
      </a>
      <TournamentNavbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <TournamentFooterStrip />
    </div>
  );
}
