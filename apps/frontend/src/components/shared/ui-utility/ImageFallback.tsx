import { cn } from "@/lib/utils";

interface ImageFallbackProps {
  sportType?: string | null;
  title?: string;
  className?: string;
  showLabel?: boolean;
}

const SPORT_FALLBACK_VISUAL: Record<
  string,
  { gradient: string; emoji: string; label: string }
> = {
  FOOTBALL: {
    gradient: "from-green-800 to-green-600",
    emoji: "⚽",
    label: "Bóng đá",
  },
  BASKETBALL: {
    gradient: "from-orange-700 to-red-600",
    emoji: "🏀",
    label: "Bóng rổ",
  },
  TENNIS: {
    gradient: "from-yellow-600 to-orange-500",
    emoji: "🎾",
    label: "Tennis",
  },
  BADMINTON: {
    gradient: "from-blue-700 to-cyan-600",
    emoji: "🏸",
    label: "Cầu lông",
  },
  VOLLEYBALL: {
    gradient: "from-sky-700 to-indigo-600",
    emoji: "🏐",
    label: "Bóng chuyền",
  },
  PICKLEBALL: {
    gradient: "from-purple-700 to-fuchsia-600",
    emoji: "🏓",
    label: "Pickleball",
  },
  DEFAULT: {
    gradient: "from-slate-700 to-slate-600",
    emoji: "🏟️",
    label: "Khu thể thao",
  },
};

export function ImageFallback({
  sportType,
  title,
  className,
  showLabel = true,
}: ImageFallbackProps) {
  const key = (sportType ?? "DEFAULT").toUpperCase();
  const visual = SPORT_FALLBACK_VISUAL[key] ?? SPORT_FALLBACK_VISUAL.DEFAULT;

  return (
    <div
      className={cn(
        "h-full w-full bg-linear-to-br text-white",
        "flex flex-col items-center justify-center gap-2",
        visual.gradient,
        className,
      )}
    >
      <span className="text-4xl opacity-90">{visual.emoji}</span>
      {showLabel ? (
        <p className="max-w-[85%] truncate text-xs font-medium text-white/80">
          {title || visual.label}
        </p>
      ) : null}
    </div>
  );
}
