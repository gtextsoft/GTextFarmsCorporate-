import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type AdminTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
};

export function AdminDataTable<T>({
  data,
  columns,
  getRowKey,
  onRowClick,
  emptyMessage = "No records found.",
  caption,
  startIndex = 0,
  showSerial = true,
  className,
}: {
  data: T[];
  columns: AdminTableColumn<T>[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  caption?: string;
  startIndex?: number;
  showSerial?: boolean;
  className?: string;
}) {
  const colSpan = columns.length + (showSerial ? 1 : 0) + (onRowClick ? 1 : 0);

  return (
    <Card className={cn("overflow-hidden shadow-sm", className)}>
      {caption && (
        <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
          {caption}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {showSerial && (
              <TableHead className="w-12 px-3 text-center text-xs uppercase">S/N</TableHead>
            )}
            {columns.map((col) => (
              <TableHead
                key={col.id}
                className={cn(
                  "px-4 text-xs uppercase tracking-wide",
                  col.hideOnMobile && "hidden sm:table-cell",
                  col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
            {onRowClick && <TableHead className="w-10 px-2" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => (
              <TableRow
                key={getRowKey(row)}
                className={cn(onRowClick && "cursor-pointer")}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {showSerial && (
                  <TableCell className="px-3 text-center text-xs tabular-nums text-muted-foreground">
                    {startIndex + index + 1}
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn(
                      "px-4 py-3",
                      col.hideOnMobile && "hidden sm:table-cell",
                      col.className,
                    )}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("a,button,input,select,textarea")) {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {col.cell(row, index)}
                  </TableCell>
                ))}
                {onRowClick && (
                  <TableCell className="px-2 text-muted-foreground">
                    <ChevronRight className="size-4" />
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {data.length > 0 && (
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          Showing {data.length} record{data.length === 1 ? "" : "s"}
        </div>
      )}
    </Card>
  );
}
