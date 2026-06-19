import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AdminStat = {
  label: string;
  value: ReactNode;
  highlight?: boolean;
  description?: string;
};

export function AdminPage({
  title,
  description,
  actions,
  stats,
  children,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  stats?: AdminStat[];
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-1 flex-col gap-6 p-4 md:p-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p
                  className={cn(
                    "mt-2 text-2xl font-semibold tabular-nums",
                    stat.highlight && "text-forest-deep",
                  )}
                >
                  {stat.value}
                </p>
                {stat.description && (
                  <p className="mt-1 text-xs text-muted-foreground">{stat.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {children}
    </div>
  );
}
