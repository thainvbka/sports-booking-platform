interface LegalDocumentsGridProps {
  docUrls: string[];
}

export function LegalDocumentsGrid({ docUrls }: LegalDocumentsGridProps) {
  if (docUrls.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
        Không tìm thấy ảnh tài liệu hợp lệ trong dữ liệu pháp lý.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {docUrls.map((docUrl, index) => (
        <a
          key={`${docUrl}-${index}`}
          href={docUrl}
          target="_blank"
          rel="noreferrer"
          className="group overflow-hidden rounded-md border border-border/60 bg-muted/20"
        >
          <div className="border-b border-border/60 px-3 py-2 text-xs font-medium text-muted-foreground">
            Tài liệu #{index + 1}
          </div>
          <img
            src={docUrl}
            alt={`Tài liệu pháp lý ${index + 1}`}
            className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}
