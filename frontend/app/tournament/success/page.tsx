import type { Metadata } from "next";
import { Suspense } from "react";

import { SuccessClient } from "@/components/tournament/SuccessClient";
import { Skeleton } from "@/components/tournament/ui";
import { TOURNAMENT_NAME } from "@/lib/tournament";

export const metadata: Metadata = {
  title: "Registration confirmation",
  description: `Your ${TOURNAMENT_NAME} registration confirmation, status and next steps.`,
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <div className="arena-surface arena-grain relative min-h-[70vh] py-14 sm:py-20">
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <SuccessClient />
        </Suspense>
      </div>
    </div>
  );
}
