import { Leaf } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 place-items-center rounded-full bg-primary text-primary-foreground",
        className,
      )}
    >
      <Leaf className="size-4" />
    </span>
  );
}
