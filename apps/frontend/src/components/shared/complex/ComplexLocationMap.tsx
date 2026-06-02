import { MapPin } from "lucide-react";

interface ComplexLocationMapProps {
  complexAddress: string;
}

export function ComplexLocationMap({ complexAddress }: ComplexLocationMapProps) {
  const encodedAddress = encodeURIComponent(complexAddress);
  const embedUrl = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <MapPin className="size-5 text-primary" />
        <h3 className="font-display text-lg font-bold text-foreground">
          Vị trí & Bản đồ
        </h3>
      </div>
      <div className="relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-sm min-h-[250px]">
        <iframe
          title="Google Maps"
          src={embedUrl}
          className="absolute inset-0 h-full w-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
