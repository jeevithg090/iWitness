import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  eyebrowIcon,
  title,
  description,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mx-auto flex max-w-2xl flex-col items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-accent-foreground [&_svg]:size-4">
          {eyebrowIcon}
          {eyebrow}
        </p>
      )}
      <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </header>
  );
}
