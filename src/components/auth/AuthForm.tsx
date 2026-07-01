import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function PasswordField({
  id,
  name,
  label,
  hint,
  labelAction,
  autoComplete,
  minLength,
  required = true,
  className,
}: {
  id: string;
  name: string;
  label: string;
  hint?: React.ReactNode;
  labelAction?: React.ReactNode;
  autoComplete?: string;
  minLength?: number;
  required?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {labelAction}
      </div>
      <div className="relative mt-1.5">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {hint && <div className="mt-1.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function AuthFormCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-card p-6 shadow-soft sm:p-8",
        className,
      )}
    >
      {children}
    </div>
  );
}
