import type { ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function RecordDetailDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "default",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "default" | "lg" | "xl";
}) {
  const sizeClass =
    size === "xl" ? "max-w-3xl" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={sizeClass}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="max-h-[65vh] overflow-y-auto pr-1">{children}</div>
        {footer && <DialogFooter className="gap-2 sm:gap-0">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export function DetailFieldGrid({
  fields,
}: {
  fields: { label: string; value: ReactNode; fullWidth?: boolean }[];
}) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.label} className={field.fullWidth ? "sm:col-span-2" : undefined}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {field.label}
          </dt>
          <dd className="mt-1 font-medium">{field.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
