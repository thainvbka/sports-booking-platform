import type { ReactNode } from "react";
import { OwnerHeroShell } from "./OwnerHeroShell";
import { StatTile, type StatTone } from "./StatTile";

export interface OwnerHeroStatItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: StatTone;
  hint?: string;
}

interface OwnerPageHeroProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  stats: OwnerHeroStatItem[];
}

export function OwnerPageHero({
  title,
  description,
  badge,
  action,
  stats,
}: OwnerPageHeroProps) {
  const statGridCols =
    stats.length === 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-4";

  return (
    <OwnerHeroShell
      title={title}
      description={description}
      badge={badge}
      action={action}
    >
      <div className={`relative mt-4 grid gap-2 ${statGridCols}`}>
        {stats.map((stat, idx) => (
          <StatTile
            key={`${stat.label}-${idx}`}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            tone={stat.tone}
            hint={stat.hint}
          />
        ))}
      </div>
    </OwnerHeroShell>
  );
}
