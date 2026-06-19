const URL_LIKE_PATTERN = /^https?:\/\//i;
const IMAGE_EXTENSION_PATTERN = /\.(png|jpe?g|webp|gif|bmp|svg)(\?.*)?$/i;

function collectUrls(value: unknown, output: string[]) {
  if (!value) return;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (
      URL_LIKE_PATTERN.test(trimmed) ||
      trimmed.startsWith("/") ||
      IMAGE_EXTENSION_PATTERN.test(trimmed)
    ) {
      output.push(trimmed);
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectUrls(item, output);
    }
    return;
  }

  if (typeof value === "object") {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectUrls(nested, output);
    }
  }
}

export function extractLegalDocumentUrls(input: unknown): string[] {
  const urls: string[] = [];
  collectUrls(input, urls);
  return Array.from(new Set(urls));
}
