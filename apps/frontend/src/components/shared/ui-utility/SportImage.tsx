import { ImageFallback } from "@/components/shared/ui-utility/ImageFallback";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SportImageProps {
  src?: string | null;
  sportType?: string | null;
  title?: string;
  className?: string;
  showFallbackLabel?: boolean;
}

export function SportImage({
  src,
  sportType,
  title,
  className,
  showFallbackLabel = false,
}: SportImageProps) {
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    setHasLoadError(false);
  }, [src]);

  if (!src || hasLoadError) {
    return (
      <ImageFallback
        sportType={sportType}
        title={title}
        className={className}
        showLabel={showFallbackLabel}
      />
    );
  }

  return (
    <img
      src={src}
      alt={title || "Hinh anh san"}
      loading="lazy"
      onError={() => setHasLoadError(true)}
      className={cn("h-full w-full object-cover", className)}
    />
  );
}