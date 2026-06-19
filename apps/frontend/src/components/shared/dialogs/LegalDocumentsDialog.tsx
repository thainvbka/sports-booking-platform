import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { extractLegalDocumentUrls } from "@/utils";
import { FileWarning, Images } from "lucide-react";

type LegalDocumentsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  verificationDocs: unknown;
};

export function LegalDocumentsDialog({
  open,
  onOpenChange,
  title,
  description,
  verificationDocs,
}: LegalDocumentsDialogProps) {
  const docs = extractLegalDocumentUrls(verificationDocs);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Images data-icon="inline-start" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description ?? "Xem các tệp hình ảnh pháp lý đã tải lên."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {docs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {docs.map((docUrl, index) => (
                <a
                  key={`${docUrl}-${index}`}
                  href={docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
                >
                  <div className="flex items-center justify-between border-b border-border/70 bg-muted/40 px-3 py-2">
                    <Badge variant="secondary">Tài liệu #{index + 1}</Badge>
                    <span className="text-xs text-muted-foreground">
                      Mở tab mới
                    </span>
                  </div>
                  <div className="aspect-[4/3] bg-muted/30">
                    <img
                      src={docUrl}
                      alt={`Tài liệu pháp lý ${index + 1}`}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.015]"
                      loading="lazy"
                    />
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 p-6 text-center">
              <FileWarning className="text-muted-foreground" />
              <p className="text-sm font-medium">Không tìm thấy ảnh tài liệu</p>
              <p className="max-w-md text-xs text-muted-foreground">
                Dữ liệu hiện tại không chứa link ảnh hợp lệ. Nếu đây là hồ sơ mới,
                chủ sân có thể chưa tải tài liệu hoặc định dạng lưu trữ chưa đúng.
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
