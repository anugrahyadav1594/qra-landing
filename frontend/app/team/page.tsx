import type { Metadata } from "next";

import { SectionHeading } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { FALLBACK_TEAM } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Team",
  description: "The people building QRA.",
};

export const dynamic = "force-dynamic";

type TeamMember = { id: string; name: string; role: string; bio: string };

const AVATAR_GRADIENTS = [
  "from-brand-400 to-brand-600",
  "from-accent-400 to-accent-500",
  "from-fuchsia-400 to-brand-500",
  "from-amber-400 to-orange-500",
];

export default async function TeamPage() {
  const data = await apiGet<{ members: TeamMember[] }>("/api/v1/team", {
    members: FALLBACK_TEAM,
  });

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <SectionHeading
        eyebrow="Team"
        title="Small team, big standards"
        description="A founding team that treats privacy, accessibility and reliability as engineering targets — not aspirations."
      />
      <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
        {data.members.map((member, index) => {
          const initials = member.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("");
          return (
            <div key={member.id} className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-bold text-white ${
                  AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length]
                }`}
                aria-hidden="true"
              >
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-white">{member.name}</h3>
                <p className="text-sm font-medium text-brand-400">{member.role}</p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">{member.bio}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
