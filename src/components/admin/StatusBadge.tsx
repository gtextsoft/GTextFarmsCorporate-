import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  verified: "border-transparent bg-forest/15 text-forest-deep",
  published: "border-transparent bg-forest/15 text-forest-deep",
  approved: "border-transparent bg-forest/15 text-forest-deep",
  active: "border-transparent bg-forest/15 text-forest-deep",
  yes: "border-transparent bg-forest/15 text-forest-deep",
  submitted: "border-transparent bg-accent/40 text-forest-deep",
  pending: "border-transparent bg-amber-100 text-amber-800",
  new: "border-transparent bg-amber-100 text-amber-800",
  read: "border-transparent bg-muted text-muted-foreground",
  rejected: "border-transparent bg-destructive/10 text-destructive",
  archived: "border-transparent bg-muted text-muted-foreground",
  draft: "border-transparent bg-muted text-muted-foreground",
  no: "border-transparent bg-muted text-muted-foreground",
  replied: "border-transparent bg-forest/10 text-forest-deep",
};

export function StatusBadge({
  status,
  label,
  className,
}: {
  status: string;
  label?: string;
  className?: string;
}) {
  const key = status.toLowerCase();
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        STATUS_STYLES[key] ?? "border-transparent bg-secondary text-secondary-foreground",
        className,
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </Badge>
  );
}

export function PublishedBadge({ published }: { published: boolean }) {
  return <StatusBadge status={published ? "yes" : "no"} label={published ? "Published" : "Draft"} />;
}
