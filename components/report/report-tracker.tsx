"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, FileSearch, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import {
  STATUS_LABELS,
  type ReportStatusValue,
  type ReportTypeValue,
} from "@/lib/constants";
import { isValidReportId, normalizeReportId } from "@/lib/report-id";

type PublicReport = {
  reportId: string;
  type: ReportTypeValue;
  reportType: string;
  title: string;
  status: ReportStatusValue;
  createdAt: string;
  updatedAt: string;
};

const STATUS_HELP: Record<ReportStatusValue, string> = {
  PENDING: "Your report is waiting to be reviewed by a moderator.",
  IN_PROGRESS: "A moderator is reviewing your report and acting on it.",
  RESOLVED: "Your report has been handled and marked as resolved.",
  DISMISSED: "Your report was reviewed and closed without further action.",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export function ReportTracker({ initialId = "" }: { initialId?: string }) {
  const router = useRouter();
  const [reportId, setReportId] = useState(initialId);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PublicReport | null>(null);

  const lookup = useCallback(
    async (raw: string) => {
      const id = normalizeReportId(raw);
      setReport(null);
      if (!id)
        return setError("Enter the report ID you received when you submitted.");
      if (!isValidReportId(id)) {
        return setError(
          "Report IDs are 16 characters long and use only 0-9 and a-f.",
        );
      }
      setError(null);
      setLoading(true);
      router.replace(`/track-report?id=${id}`, { scroll: false });
      try {
        const res = await fetch(`/api/reports/${id}/details`);
        const data = await res.json().catch(() => ({}));
        if (res.status === 404)
          throw new Error("No report matches that ID. Check it and try again.");
        if (!res.ok)
          throw new Error(data.error || "Lookup failed. Please try again.");
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lookup failed.");
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (initialId) lookup(initialId);
    // Only auto-run once for the ID in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto grid max-w-4xl items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <Card className="p-5 sm:p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            lookup(reportId);
          }}
          noValidate
          className="space-y-5"
        >
          <Field
            id="reportId"
            label="Report ID"
            error={error ?? undefined}
            hint="e.g. 3f9a1c0b7d2e4a68"
          >
            {(props) => (
              <Input
                {...props}
                value={reportId}
                onChange={(e) => setReportId(e.target.value)}
                className="font-mono tracking-wider"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={32}
                placeholder="16-character ID"
              />
            )}
          </Field>
          <Button type="submit" className="w-full" loading={loading}>
            {!loading && <Search aria-hidden="true" />}
            {loading ? "Searching…" : "Track report"}
          </Button>
        </form>
      </Card>

      <section aria-live="polite" aria-busy={loading}>
        {loading ? (
          <Card className="space-y-4 p-6">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-7 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ) : report ? (
          <Card className="animate-fade-up p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={report.status} />
              <TypeBadge type={report.type} />
              <span className="text-xs text-muted-foreground">
                {report.reportType}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {report.title}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {STATUS_HELP[report.status]}
            </p>
            <dl className="mt-6 grid gap-4 border-t border-border pt-5 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Report ID</dt>
                <dd className="mt-1 break-all font-mono">{report.reportId}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">{STATUS_LABELS[report.status]}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarClock className="size-3.5" aria-hidden="true" />{" "}
                  Submitted
                </dt>
                <dd className="mt-1">{formatDate(report.createdAt)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarClock className="size-3.5" aria-hidden="true" /> Last
                  updated
                </dt>
                <dd className="mt-1">{formatDate(report.updatedAt)}</dd>
              </div>
            </dl>
          </Card>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
            <FileSearch
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="mt-4 font-medium">No report selected</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Enter your report ID to see its current status.
            </p>
          </div>
        )}
        {report && (
          <Alert tone="info" className="mt-4">
            For your privacy, the location, description and photo aren&apos;t
            shown here.
          </Alert>
        )}
      </section>
    </div>
  );
}
