import { SportImage } from "@/components/shared/SportImage";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { PublicSubfieldDetail } from "@/types";
import { getSportTypeLabel } from "@/utils";
import { Clock3, MapPin, Star, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

const MAX_GALLERY_IMAGES = 4;

type SubfieldImageCollection = PublicSubfieldDetail & {
  images?: string[] | null;
  sub_field_images?: string[] | null;
  subfield_images?: string[] | null;
};

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const getSubfieldGalleryImages = (
  subfield: PublicSubfieldDetail,
): Array<string | undefined> => {
  const subfieldWithGallery = subfield as SubfieldImageCollection;

  const payloadImages = [
    subfieldWithGallery.images,
    subfieldWithGallery.sub_field_images,
    subfieldWithGallery.subfield_images,
  ].flatMap((images) => (Array.isArray(images) ? images : []));

  const uniqueImages = Array.from(
    new Set([subfield.sub_field_image, ...payloadImages].filter(isNonEmptyString)),
  ).slice(0, MAX_GALLERY_IMAGES);

  return Array.from(
    { length: MAX_GALLERY_IMAGES },
    (_, index) => uniqueImages[index],
  );
};

interface SubfieldHeroInfoProps {
  subfield: PublicSubfieldDetail;
  rating: number;
  reviewCount: number;
  operatingHours: string;
  courtTypeLabel?: string;
}

export function SubfieldHeroInfo({
  subfield,
  rating,
  reviewCount,
  operatingHours,
  courtTypeLabel,
}: SubfieldHeroInfoProps) {
  const galleryImages = getSubfieldGalleryImages(subfield);
  const [mainImage, ...thumbnailImages] = galleryImages;
  const sportLabel = getSportTypeLabel(subfield.sport_type);

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 text-white">
      {isNonEmptyString(mainImage) ? (
        <img
          aria-hidden
          src={mainImage}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-40 blur-[2px]"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-slate-950/60 via-slate-950/85 to-slate-950"
      />
      <div aria-hidden className="absolute inset-0 sports-field-pattern opacity-12" />
      <div
        aria-hidden
        className="absolute -left-24 top-4 size-64 rounded-full bg-primary/30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-20 bottom-0 size-56 rounded-full bg-accent-sport/25 blur-3xl"
      />

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-6 px-4 pt-5 pb-8 sm:px-6 lg:px-8 lg:pt-6 lg:pb-10">
        <Breadcrumb>
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-white/60 hover:text-white">
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="[&>svg]:text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbLink asChild className="text-white/60 hover:text-white">
                <Link to="/search?tab=subfields">Tìm sân</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="[&>svg]:text-white/30" />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[200px] truncate text-white sm:max-w-none">
                {subfield.sub_field_name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-accent-sport opacity-70" />
                <span className="relative inline-flex size-2 rounded-full bg-accent-sport" />
              </span>
              <span>Venue profile</span>
              <span className="h-px w-6 bg-white/20" />
              <Badge
                variant="secondary"
                className="rounded-full border-0 bg-white/10 px-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm"
              >
                {sportLabel}
              </Badge>
            </div>

            <h1 className="leading-[1.05] tracking-tight italic sm:text-4xl lg:text-5xl text-title">
              {subfield.sub_field_name}
            </h1>

            <div className="flex items-start gap-2 text-white/80">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-sport" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-white">
                  {subfield.complex.complex_name}
                </span>
                <span className="mx-1.5 text-white/40">·</span>
                <span className="text-white/70">{subfield.complex.complex_address}</span>
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <StatChip
                label="Đánh giá"
                value={rating > 0 ? rating.toFixed(1) : "—"}
                sub={`${reviewCount} nhận xét`}
                icon={<Star className="h-3.5 w-3.5 fill-accent-sport text-accent-sport" />}
                highlight
              />
              <StatChip
                label="Sức chứa"
                value={String(subfield.capacity)}
                sub="người"
                icon={<Users className="h-3.5 w-3.5 text-white/70" />}
              />
              <StatChip
                label="Giờ sân"
                value={operatingHours}
                icon={<Clock3 className="h-3.5 w-3.5 text-white/70" />}
              />
              <StatChip
                label="Môn"
                value={sportLabel}
                sub={courtTypeLabel ?? "Sẵn sàng thi đấu"}
                icon={<Trophy className="h-3.5 w-3.5 text-white/70" />}
              />
            </dl>
          </div>

          <HeroGallery
            mainImage={mainImage}
            thumbnails={thumbnailImages}
            sportType={subfield.sport_type}
            title={subfield.sub_field_name}
          />
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-b from-transparent to-background"
      />
    </section>
  );
}

interface StatChipProps {
  icon: ReactNode;
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}

function StatChip({ icon, label, value, sub, highlight }: StatChipProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border px-3 py-2.5 backdrop-blur-sm transition-colors ${
        highlight
          ? "border-accent-sport/30 bg-accent-sport/10"
          : "border-white/10 bg-white/[0.05] hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/55">
        <span className="truncate">{label}</span>
        {icon}
      </div>
      <div className="mt-1 truncate font-display text-lg leading-none font-black text-white">
        {value}
      </div>
      {sub ? (
        <div className="mt-0.5 truncate text-[11px] text-white/60">{sub}</div>
      ) : null}
    </div>
  );
}

interface HeroGalleryProps {
  mainImage: string | undefined;
  thumbnails: Array<string | undefined>;
  sportType: PublicSubfieldDetail["sport_type"];
  title: string;
}

function HeroGallery({ mainImage, thumbnails, sportType, title }: HeroGalleryProps) {
  const previewThumbs = thumbnails.slice(0, 2);

  return (
    <div className="relative lg:pl-4">
      <div className="grid grid-cols-5 gap-2">
        <div className="relative col-span-5 aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl shadow-black/40 sm:col-span-3">
          <SportImage
            src={mainImage}
            sportType={sportType}
            title={title}
            className="h-full w-full"
            showFallbackLabel
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-tr from-slate-950/50 via-transparent to-transparent"
          />
          <span className="absolute bottom-2 left-2 rounded-full border border-white/20 bg-slate-950/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
            Main view
          </span>
        </div>

        <div className="col-span-5 grid grid-cols-2 gap-2 sm:col-span-2 sm:grid-cols-1">
          {previewThumbs.map((image, index) => (
            <div
              key={`subfield-thumb-${index}`}
              className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] sm:aspect-auto"
            >
              <SportImage
                src={image}
                sportType={sportType}
                title={title}
                className="h-full w-full"
                showFallbackLabel={false}
              />
              {!isNonEmptyString(image) ? (
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-br from-slate-900/40 to-slate-950/60"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
