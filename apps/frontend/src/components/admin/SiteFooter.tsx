import { Link } from "react-router-dom";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-border/60 bg-background/60">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
      />
      <div className="flex flex-col items-center justify-between gap-2 px-4 py-3 text-[11px] text-muted-foreground md:flex-row md:px-6">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative inline-flex size-1.5 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50" />
              <span className="relative inline-block size-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="font-semibold uppercase tracking-[0.22em] text-foreground/80">
              Hệ thống ổn định
            </span>
          </span>
          <span className="hidden text-border md:inline">·</span>
          <span className="hidden md:inline">
            Phản hồi trung bình{" "}
            <span className="font-mono tabular-nums text-foreground">
              ~120ms
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono tabular-nums">v1.0.0</span>
          <span className="text-border">·</span>
          <span>
            © {year}{" "}
            <Link
              to="/"
              className="font-display font-bold italic text-foreground transition-colors hover:text-primary"
            >
              T-Sport
            </Link>{" "}
            · Admin Console
          </span>
        </div>
      </div>
    </footer>
  );
}
