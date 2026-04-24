"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarRange,
  ChevronDown,
  Database,
  Download,
  Settings,
  ShieldCheck,
  Sliders,
} from "lucide-react";

export function QuickActions() {
  return (
    <div className="flex items-center gap-2">
      {/* Time range chip — visual-only indicator of the default window */}
      <Badge
        variant="outline"
        className="hidden h-9 gap-1.5 rounded-full border-dashed border-border bg-background/60 px-3 text-[11px] font-semibold text-muted-foreground md:inline-flex"
      >
        <CalendarRange className="size-3.5" />
        30 ngày gần nhất
      </Badge>

      {/* Export */}
      <Button
        variant="outline"
        size="sm"
        className="hidden h-9 gap-2 font-semibold md:inline-flex"
      >
        <Download className="size-4 text-muted-foreground" />
        Xuất báo cáo
      </Button>

      {/* Actions dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            className="h-9 gap-2 font-semibold shadow-sm"
          >
            <Sliders className="size-4" />
            Thao tác
            <ChevronDown className="size-3.5 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-60 overflow-hidden p-1.5"
        >
          <DropdownMenuLabel className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Quản trị
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer gap-3 rounded-md py-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-3.5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold">
                  Duyệt yêu cầu
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Hồ sơ chủ sân đang chờ
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer gap-3 rounded-md py-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Database className="size-3.5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold">
                  Sao lưu dữ liệu
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Snapshot hệ thống
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1.5" />

          <DropdownMenuLabel className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Hệ thống
          </DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem className="cursor-pointer gap-3 rounded-md py-2">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                <Settings className="size-3.5" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[13px] font-semibold">
                  Cài đặt chung
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Cấu hình nền tảng
                </span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
