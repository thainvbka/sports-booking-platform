import { SPORT_EMOJIS, SPORT_TYPE_LABELS } from "@/constants";
import { cn } from "@/lib/utils";
import type { SportType } from "@/types";

interface ImageFallbackProps {
  sportType?: string | null;
  title?: string;
  className?: string;
  showLabel?: boolean;
}

const SPORT_FALLBACK_GRADIENTS: Record<string, string> = {
  FOOTBALL: "from-green-800 to-green-600",
  BASKETBALL: "from-orange-700 to-red-600",
  TENNIS: "from-yellow-600 to-orange-500",
  BADMINTON: "from-blue-700 to-cyan-600",
  VOLLEYBALL: "from-sky-700 to-indigo-600",
  PICKLEBALL: "from-purple-700 to-fuchsia-600",
  DEFAULT: "from-slate-700 to-slate-600",
};

export function ImageFallback({
  sportType,
  title,
  className,
  showLabel = true,
}: ImageFallbackProps) {
  const key = (sportType ?? "DEFAULT").toUpperCase();
  const gradient = SPORT_FALLBACK_GRADIENTS[key] ?? SPORT_FALLBACK_GRADIENTS.DEFAULT;
  const emoji = SPORT_EMOJIS[key as SportType] ?? "🏟️";
  const label = SPORT_TYPE_LABELS[key as SportType] ?? "Khu thể thao";

  return (
    <div
      className={cn(
        "h-full w-full bg-linear-to-br text-white",
        "flex flex-col items-center justify-center gap-2",
        gradient,
        className,
      )}
    >
      <span className="text-4xl opacity-90">{emoji}</span>
      {showLabel ? (
        <p className="max-w-[85%] truncate text-xs font-medium text-white/80">
          {title || label}
        </p>
      ) : null}
    </div>
  );
}
