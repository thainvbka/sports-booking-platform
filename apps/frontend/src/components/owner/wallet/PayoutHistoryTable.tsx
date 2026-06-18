import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { STATUS_TONES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils";
import { FileText } from "lucide-react";
import { PayoutBatchDetailDialog } from "./PayoutBatchDetailDialog";

import type { PayoutBatchRecord } from "@/services/payout.service";

interface PayoutHistoryTableProps {
  batches: PayoutBatchRecord[] | undefined;
}

export function PayoutHistoryTable({ batches }: PayoutHistoryTableProps) {
  return (
    <Card className="border border-border/60 shadow-sm overflow-hidden h-full">
      <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FileText className="size-4" />
          </span>
          <div className="flex flex-col">
            <CardTitle className="text-base font-bold text-foreground">
              Lịch sử Quyết toán
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              Lịch sử các đợt Admin thanh toán công nợ
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="opacity-60" />
      <CardContent className="p-0">
        {!batches || batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-8 py-16">
            <FileText className="size-10 text-muted-foreground opacity-30 stroke-[1.5] mb-2" />
            <span className="text-xs font-semibold text-foreground">
              Không có lịch sử thanh toán
            </span>
            <p className="text-[10.5px] text-muted-foreground max-w-xs mt-1">
              Khi bạn thực hiện rút số dư khả dụng và được Admin duyệt chi trả,
              các đợt thanh toán sẽ xuất hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border/60">
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-4 py-3">
                    Đợt quyết toán
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3">
                    Ngày gửi
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3 text-right">
                    Tổng tiền
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-3">
                    Trạng thái
                  </TableHead>
                  <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pr-4 py-3 text-right">
                    Chi tiết
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => {
                  const tone =
                    STATUS_TONES[batch.status] || STATUS_TONES.PENDING;
                  const StatusIcon = tone.icon;
                  return (
                    <TableRow
                      key={batch.id}
                      className="border-b border-border/40 hover:bg-muted/10 transition-colors"
                    >
                      <TableCell className="pl-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-foreground">
                            {batch.payout_period}
                          </span>
                          {batch.transaction_ref && (
                            <span className="text-[9.5px] font-mono text-muted-foreground mt-0.5">
                              Ref: {batch.transaction_ref}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-muted-foreground">
                        {new Date(batch.created_at).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="py-3 text-xs text-right font-display font-bold italic tabular-nums text-foreground">
                        {formatPrice(Number(batch.total_payout))}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-5 gap-1 rounded-full px-2 text-[9.5px] font-semibold uppercase tracking-wider",
                            tone.bg,
                            tone.border,
                          )}
                        >
                          <StatusIcon className="size-2.5 shrink-0" />
                          {tone.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-4 py-3 text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-[10.5px] font-semibold rounded-full px-3 hover:bg-muted"
                            >
                              Xem chi tiết
                            </Button>
                          </DialogTrigger>
                          <PayoutBatchDetailDialog batch={batch} tone={tone} />
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
