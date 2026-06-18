import { SectionHeader } from "@/components/marketing/SectionHeader";
import { teamMembers as fallbackTeamMembers } from "@/lib/mock-data";

type TeamMember = {
  name: string;
  role: string;
  img: string;
  yearsExperience: number;
  bio: string;
  credentials: string[];
};

export function Team({ members }: { members?: TeamMember[] }) {
  const teamList = members && members.length > 0 ? members : fallbackTeamMembers;
  return (
    <section id="team" className="bg-bone/60 px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="The team behind the birds"
          title="Real people. Named. Accountable."
          sub="Every farm has a named operations manager, veterinarian, and field officer publishing reports under their own name."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {teamList.map((p) => (
            <div
              key={p.name}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft"
            >
              <div className="aspect-[4/5] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  width={900}
                  height={1100}
                  loading="lazy"
                  className="size-full object-cover"
                />
              </div>
              <div className="p-5">
                <div className="font-display text-2xl">{p.name}</div>
                <div className="text-sm text-muted-foreground">{p.role}</div>
                <p className="mt-1 text-xs font-medium text-forest-deep">
                  {p.yearsExperience} years experience
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{p.bio}</p>
                <ul className="mt-3 space-y-1">
                  {p.credentials.map((c) => (
                    <li key={c} className="text-xs text-muted-foreground">
                      · {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
