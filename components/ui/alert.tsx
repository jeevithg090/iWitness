import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  info: {
    icon: Info,
    className:
      "border-primary/30 bg-primary/5 text-foreground [&>svg]:text-primary",
  },
  success: {
    icon: CheckCircle2,
    className: "border-success/30 bg-success/5 [&>svg]:text-success",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-warning/30 bg-warning/5 [&>svg]:text-warning",
  },
  error: {
    icon: XCircle,
    className:
      "border-destructive/30 bg-destructive/5 [&>svg]:text-destructive",
  },
} as const;

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: keyof typeof tones;
  title?: string;
}

export function Alert({
  tone = "info",
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const { icon: Icon, className: toneClass } = tones[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-sm",
        toneClass,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="space-y-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className="text-muted-foreground">{children}</div>}
      </div>
    </div>
  );
}
