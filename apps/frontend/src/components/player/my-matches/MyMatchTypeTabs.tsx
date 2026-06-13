import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  MY_MATCH_TYPES,
  MY_MATCH_TYPE_LABELS,
  type MyMatchType,
} from "@/types/match.type";
import { Hourglass, Trophy, UsersRound } from "lucide-react";
import { type ComponentType } from "react";

const TAB_META: Record<
  MyMatchType,
  {
    icon: ComponentType<{ className?: string }>;
    description: string;
    tint: string;
    dot: string;
  }
> = {
  created: {
    icon: Trophy,
    description: "Do bạn khởi tạo",
    tint: "data-[state=active]:bg-primary/10 data-[state=active]:border-primary/30",
    dot: "bg-primary",
  },
  joined: {
    icon: UsersRound,
    description: "Đã được duyệt",
    tint: "data-[state=active]:bg-accent-sport/10 data-[state=active]:border-accent-sport/30",
    dot: "bg-accent-sport",
  },
  pending: {
    icon: Hourglass,
    description: "Đang chờ duyệt",
    tint: "data-[state=active]:bg-amber-500/10 data-[state=active]:border-amber-400/40",
    dot: "bg-amber-500",
  },
};

const parseMyMatchType = (value: string): MyMatchType | undefined =>
  MY_MATCH_TYPES.find((item) => item === value);

interface MyMatchTypeTabsProps {
  type: MyMatchType;
  onTypeChange: (type: MyMatchType) => void;
  myMatchesSummary: Record<MyMatchType, number> | null;
  onPageReset: () => void;
}

export function MyMatchTypeTabs({
  type,
  onTypeChange,
  myMatchesSummary,
  onPageReset,
}: MyMatchTypeTabsProps) {
  return (
    <Tabs
      value={type}
      onValueChange={(value) => {
        const nextType = parseMyMatchType(value);
        if (!nextType) return;
        onTypeChange(nextType);
        onPageReset();
      }}
    >
      <TabsList className="grid h-auto w-full grid-cols-1 gap-2 rounded-2xl bg-transparent p-0 sm:grid-cols-3">
        {MY_MATCH_TYPES.map((matchType) => {
          const meta = TAB_META[matchType];
          const Icon = meta.icon;
          const count = myMatchesSummary?.[matchType] ?? 0;
          return (
            <TabsTrigger
              key={matchType}
              value={matchType}
              className={cn(
                "group flex h-auto flex-col items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-4 py-3.5 text-left shadow-sm backdrop-blur-sm",
                "data-[state=active]:border-transparent data-[state=active]:shadow-md",
                "hover:border-border hover:bg-card",
                meta.tint,
              )}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <span
                    className={cn(
                      "flex size-8 items-center justify-center rounded-xl bg-muted/70 text-foreground/80 transition-colors group-data-[state=active]:bg-background",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {meta.description}
                    </span>
                    <span className="font-display text-sm font-bold italic text-foreground">
                      {MY_MATCH_TYPE_LABELS[matchType]}
                    </span>
                  </span>
                </span>

                <span className="flex items-baseline gap-1">
                  <span className="font-display text-2xl font-black italic tabular-nums text-foreground">
                    {count ?? "—"}
                  </span>
                </span>
              </div>

              <span
                aria-hidden
                className={cn(
                  "h-0.5 w-full origin-left rounded-full bg-transparent transition-all",
                  "group-data-[state=active]:bg-gradient-to-r",
                  matchType === "created" &&
                    "group-data-[state=active]:from-primary group-data-[state=active]:to-blue-400",
                  matchType === "joined" &&
                    "group-data-[state=active]:from-accent-sport group-data-[state=active]:to-emerald-400",
                  matchType === "pending" &&
                    "group-data-[state=active]:from-amber-500 group-data-[state=active]:to-amber-300",
                )}
              />
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
