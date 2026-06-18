import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ComponentType, SVGProps } from "react";

interface ChartCardProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  children: React.ReactNode;
  isEmpty: boolean;
}

export function ChartCard({
  icon: Icon,
  title,
  description,
  children,
  isEmpty,
}: ChartCardProps) {
  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="flex-row items-start justify-between gap-3 pb-3">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4" />
          </span>
          <div className="flex flex-col">
            <CardTitle className="text-base font-bold text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="mt-0.5 text-xs">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator className="opacity-60" />
      <CardContent className="p-4 md:p-5">
        {isEmpty ? (
          <div className="flex h-[300px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 bg-muted/30 text-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Icon className="size-5" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Chưa có dữ liệu
            </p>
            <p className="max-w-[18rem] text-xs text-muted-foreground/80">
              Dữ liệu sẽ hiển thị khi bạn có lượt đặt sân.
            </p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
