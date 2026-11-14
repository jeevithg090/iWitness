import * as React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldRenderProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
};

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}

/** Label + control + hint/error wired together with the right aria attributes. */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  optional,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline gap-2 text-sm font-medium"
      >
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
        {optional && (
          <span className="text-xs font-normal text-muted-foreground">
            Optional
          </span>
        )}
      </label>
      {children({
        id,
        "aria-invalid": !!error,
        "aria-describedby": describedBy,
        "aria-required": required || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </div>
  );
}

export function FieldError({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <p
      id={id}
      className="flex items-center gap-1.5 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
