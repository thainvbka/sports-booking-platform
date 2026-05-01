import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  className?: string;
  cell?: (item: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  paginationStyle?: "compact" | "search";
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  isLoading,
  pagination,
  paginationStyle = "compact",
  emptyMessage = "Không có dữ liệu",
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[720px]">
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={`${onRowClick ? "cursor-pointer" : ""} ${
                      isLoading ? "opacity-50" : ""
                    }`}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((column, colIndex) => (
                      <TableCell key={colIndex} className={column.className}>
                        {column.cell
                          ? column.cell(item, rowIndex)
                          : column.accessorKey
                          ? (item[column.accessorKey as keyof T] as ReactNode)
                          : null}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination &&
        pagination.totalPages > 1 &&
        (paginationStyle === "search" ? (
          <SearchStylePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            isLoading={isLoading}
            onPageChange={pagination.onPageChange}
          />
        ) : (
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground tabular-nums">
              Trang {pagination.page} / {pagination.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft data-icon="inline-start" />
                Trước
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                Sau
                <ChevronRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        ))}
    </div>
  );
}

interface SearchStylePaginationProps {
  page: number;
  totalPages: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

function SearchStylePagination({
  page,
  totalPages,
  isLoading,
  onPageChange,
}: SearchStylePaginationProps) {
  const pageItems = buildPageList(page, totalPages);

  const go = (event: MouseEvent, target: number) => {
    event.preventDefault();
    if (isLoading) return;
    if (target < 1 || target > totalPages || target === page) return;
    onPageChange(target);
  };

  return (
    <Pagination className="mt-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1 || isLoading}
            className={cn((page === 1 || isLoading) && "pointer-events-none opacity-50")}
            onClick={(event) => go(event, page - 1)}
          />
        </PaginationItem>

        {pageItems.map((item, idx) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href="#"
                isActive={item === page}
                onClick={(event) => go(event, item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === totalPages || isLoading}
            className={cn(
              (page === totalPages || isLoading) && "pointer-events-none opacity-50",
            )}
            onClick={(event) => go(event, page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "ellipsis")[] = [1];

  if (current > 3) items.push("ellipsis");

  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  for (let i = from; i <= to; i++) items.push(i);

  if (current < total - 2) items.push("ellipsis");

  items.push(total);
  return items;
}
