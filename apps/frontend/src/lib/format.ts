/** Format a number as Vietnamese Dong, e.g. "1.250.000 ₫" */
export const fmtVND = (n: number): string =>
  `${new Intl.NumberFormat("vi-VN").format(n)} ₫`;

/** Abbreviate large numbers: 1_500_000 → "1.5M", 25_000 → "25K" */
export const fmtM = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(0)}K`
      : String(n);

/** Format as percentage with one decimal, e.g. "12.5%" */
export const fmtPct = (n: number): string => `${Number(n).toFixed(1)}%`;
