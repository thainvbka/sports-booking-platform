import type { ReactNode } from "react";
import { OwnerHeroShell } from "./OwnerHeroShell";
import { StatCard, StatTile, type StatTone } from "./StatDisplay";

export interface OwnerHeroStatItem {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  tone: StatTone;
  hint?: string;
  delta?: {
    kind: "percent" | "count";
    value: number;
    hint: string;
  };
  extra?: ReactNode;
}

interface OwnerPageHeroProps {
  title: ReactNode;
  description?: ReactNode;
  badge?: ReactNode;
  action?: ReactNode;
  stats: OwnerHeroStatItem[];
  variant?: "card" | "tile";
}

export function OwnerPageHero({
  title,
  description,
  badge,
  action,
  stats,
  variant = "tile",
}: OwnerPageHeroProps) {
  const statGridCols =
    stats.length === 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : stats.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-2 sm:grid-cols-4";

  return (
    <OwnerHeroShell
      title={title}
      description={description}
      badge={badge}
      action={action}
    >
      <div className={`relative mt-4 grid gap-2 ${statGridCols}`}>
        {stats.map((stat, idx) => {
          const valStr =
            typeof stat.value === "number"
              ? stat.value.toLocaleString()
              : stat.value;

          if (variant === "card") {
            return (
              <StatCard
                key={`${stat.label}-${idx}`}
                icon={stat.icon}
                label={stat.label}
                value={valStr}
                tone={stat.tone}
                hint={stat.hint}
                delta={stat.delta}
                extra={stat.extra}
              />
            );
          }

          return (
            <StatTile
              key={`${stat.label}-${idx}`}
              icon={stat.icon}
              label={stat.label}
              value={valStr}
              tone={stat.tone}
              hint={stat.hint}
            />
          );
        })}
      </div>
    </OwnerHeroShell>
  );
}
