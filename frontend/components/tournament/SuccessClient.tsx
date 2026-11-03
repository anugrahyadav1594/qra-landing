"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { RegistrationSuccess } from "@/components/tournament/RegistrationSuccess";
import { fetchTournament } from "@/lib/tournamentApi";
import { DEFAULT_TOURNAMENT_CONFIG, type TournamentConfig } from "@/lib/tournament";

/** Client wrapper: reads the `?new=1` flag and the live configuration. */
export function SuccessClient() {
  const params = useSearchParams();
  const justRegistered = params.get("new") === "1";
  const [config, setConfig] = useState<TournamentConfig>(DEFAULT_TOURNAMENT_CONFIG);

  useEffect(() => {
    let cancelled = false;
    fetchTournament()
      .then((data) => {
        if (!cancelled) setConfig(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return <RegistrationSuccess config={config} justRegistered={justRegistered} />;
}
