"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle2, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { CopyButton } from "./copy-button";

export function ReportSubmitted({
  reportId,
  onReset,
}: {
  reportId: string;
  onReset: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), []);

  return (
    <div className="animate-fade-up space-y-8 text-center">
      <div className="flex flex-col items-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-9" aria-hidden="true" />
        </span>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 text-2xl font-semibold tracking-tight outline-none"
        >
          Report submitted
        </h2>
        <p className="mt-2 max-w-md text-muted-foreground">
          Thank you. Your report has been received and will be reviewed by a
          moderator.
        </p>
      </div>

      <div className="mx-auto max-w-md rounded-xl border border-border bg-muted/40 p-5 text-left">
        <p className="text-sm font-medium">Your report ID</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <code className="flex-1 select-all break-all rounded-lg border border-border bg-background px-3 py-2.5 font-mono text-lg tracking-wider text-primary">
            {reportId}
          </code>
          <CopyButton value={reportId} />
        </div>
      </div>

      <Alert
        tone="warning"
        title="Save this ID now"
        className="mx-auto max-w-md text-left"
      >
        It is the only way to check on your report. We can&apos;t recover it for
        you because we don&apos;t know who you are.
      </Alert>

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={`/track-report?id=${reportId}`}
          className={buttonVariants()}
        >
          <Search aria-hidden="true" />
          Track this report
        </Link>
        <button
          type="button"
          onClick={onReset}
          className={buttonVariants({ variant: "secondary" })}
        >
          Submit another report
        </button>
      </div>
    </div>
  );
}
