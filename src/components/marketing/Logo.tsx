import { Leaf } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/favicon.svg"
      alt="GText Farms"
      className={cn("size-8 rounded-full", className)}
    />
  );
}

/** Inline mark for contexts that need the vector leaf (e.g. loading states). */
export function LogoMark({ className }: { className?: string }) {
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
