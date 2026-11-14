"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Inbox,
  MapPin,
  RefreshCw,
  Search,
  CalendarClock,
  Hash,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, TypeBadge } from "@/components/status-badge";
import {
  REPORT_STATUSES,
  REPORT_TYPES,
  STATUS_LABELS,
  TYPE_LABELS,
  type ReportStatusValue,
  type ReportTypeValue,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

export type DashboardReport = {
  id: string;
  reportId: string;
  type: ReportTypeValue;
  reportType: string;
  title: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: ReportStatusValue;
  createdAt: string;
  updatedAt: string;
  hasImage: boolean;
};

type LoadState = "loading" | "ready" | "error";

const STAT_ACCENTS: Record<ReportStatusValue, string> = {
  PENDING: "text-warning",
  IN_PROGRESS: "text-primary",
  RESOLVED: "text-success",
  DISMISSED: "text-muted-foreground",
};

export function Dashboard() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<DashboardReport[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ReportStatusValue | "ALL">("ALL");
  const [type, setType] = useState<ReportTypeValue | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const res = await fetch("/api/reports", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not load reports.");
      setReports(data);
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load reports.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(() => {
    const c = Object.fromEntries(REPORT_STATUSES.map((s) => [s, 0])) as Record<
      ReportStatusValue,
      number
    >;
    for (const r of reports) c[r.status] += 1;
    return c;
  }, [reports]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reports.filter(
      (r) =>
        (status === "ALL" || r.status === status) &&
        (type === "ALL" || r.type === type) &&
        (!q ||
          [r.title, r.description, r.location ?? "", r.reportId, r.reportType]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    );
  }, [reports, status, type, query]);

  const updateStatus = async (
    report: DashboardReport,
    next: ReportStatusValue,
  ) => {
    const previous = report.status;
    setUpdating(report.id);
    setReports((rs) =>
      rs.map((r) => (r.id === report.id ? { ...r, status: next } : r)),
    );
    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Update failed.");
      setReports((rs) =>
        rs.map((r) => (r.id === report.id ? { ...r, ...data } : r)),
      );
      toast.success(
        `Marked “${report.title}” as ${STATUS_LABELS[next].toLowerCase()}.`,
      );
    } catch (err) {
      setReports((rs) =>
        rs.map((r) => (r.id === report.id ? { ...r, status: previous } : r)),
      );
      toast.error(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setUpdating(null);
    }
  };

  const hasFilters = status !== "ALL" || type !== "ALL" || query.trim() !== "";

  return (
    <div className="container py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Reports dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Signed in as {session?.user?.name ?? "staff"}
            {session?.user?.role && ` · ${session.user.role.toLowerCase()}`}
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={load}
          loading={state === "loading"}
        >
          {state !== "loading" && <RefreshCw aria-hidden="true" />}
          Refresh
        </Button>
      </div>

      <section
        aria-label="Report totals"
        className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {REPORT_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(status === s ? "ALL" : s)}
            aria-pressed={status === s}
            className={cn(
              "rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40",
              status === s && "border-primary ring-1 ring-primary",
            )}
          >
            <span className="text-sm text-muted-foreground">
              {STATUS_LABELS[s]}
            </span>
            <span
              className={cn(
                "mt-1 block text-2xl font-bold tabular-nums",
                STAT_ACCENTS[s],
              )}
            >
              {state === "loading" ? (
                <Skeleton className="h-8 w-10" />
              ) : (
                counts[s]
              )}
            </span>
          </button>
        ))}
      </section>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="search" className="sr-only">
            Search reports
          </label>
          <Input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, description, location or ID"
            className="pl-9"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 md:flex">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <Select
            id="status-filter"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as ReportStatusValue | "ALL")
            }
            className="md:w-44"
          >
            <option value="ALL">All statuses</option>
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <label htmlFor="type-filter" className="sr-only">
            Filter by urgency
          </label>
          <Select
            id="type-filter"
            value={type}
            onChange={(e) => setType(e.target.value as ReportTypeValue | "ALL")}
            className="md:w-44"
          >
            <option value="ALL">All urgencies</option>
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6" aria-live="polite" aria-busy={state === "loading"}>
        {state === "loading" && (
          <ul className="grid gap-4" aria-label="Loading reports">
            {[0, 1, 2].map((i) => (
              <li key={i}>
                <Card className="space-y-3 p-6">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              </li>
            ))}
          </ul>
        )}

        {state === "error" && (
          <Alert tone="error" title="Couldn't load reports">
            <p>{error}</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={load}
            >
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </Alert>
        )}

        {state === "ready" && (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              Showing {filtered.length} of {reports.length} report
              {reports.length === 1 ? "" : "s"}
            </p>
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
                <Inbox
                  className="size-10 text-muted-foreground"
                  aria-hidden="true"
                />
                <p className="mt-4 font-medium">
                  {reports.length === 0
                    ? "No reports yet"
                    : "No reports match these filters"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {reports.length === 0
                    ? "New anonymous reports will appear here as soon as they're submitted."
                    : "Try a different search or clear the filters."}
                </p>
                {hasFilters && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setStatus("ALL");
                      setType("ALL");
                      setQuery("");
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <ul className="grid gap-4">
                {filtered.map((report) => (
                  <li key={report.id}>
                    <ReportCard
                      report={report}
                      updating={updating === report.id}
                      onStatusChange={(s) => updateStatus(report, s)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ReportCard({
  report,
  updating,
  onStatusChange,
}: {
  report: DashboardReport;
  updating: boolean;
  onStatusChange: (status: ReportStatusValue) => void;
}) {
  const selectId = `status-${report.id}`;
  const mapsUrl =
    report.latitude != null && report.longitude != null
      ? `https://www.openstreetmap.org/?mlat=${report.latitude}&mlon=${report.longitude}#map=17/${report.latitude}/${report.longitude}`
      : null;

  return (
    <Card className="p-5 transition-colors hover:border-foreground/20 sm:p-6">
      <article className="flex flex-col gap-5 md:flex-row">
        {report.hasImage && (
          <a
            href={`/api/reports/${report.id}/image`}
            target="_blank"
            rel="noreferrer"
            className="block shrink-0 overflow-hidden rounded-lg border border-border md:w-48"
            aria-label={`Open evidence photo for “${report.title}” in a new tab`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- authenticated API image */}
            <img
              src={`/api/reports/${report.id}/image`}
              alt=""
              loading="lazy"
              className="h-40 w-full object-cover transition-transform hover:scale-105 md:h-full"
            />
          </a>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <TypeBadge type={report.type} />
            <span className="text-xs text-muted-foreground">
              {report.reportType}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold leading-snug">
            {report.title}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {report.description}
          </p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <dt>
                <MapPin className="size-4" aria-label="Location" />
              </dt>
              <dd>
                {report.location || "No location given"}
                {mapsUrl && (
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Map <ExternalLink className="size-3" aria-hidden="true" />
                  </a>
                )}
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>
                <CalendarClock className="size-4" aria-label="Submitted" />
              </dt>
              <dd>
                <time dateTime={report.createdAt}>
                  {new Date(report.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </time>
              </dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt>
                <Hash className="size-4" aria-label="Report ID" />
              </dt>
              <dd className="font-mono">{report.reportId}</dd>
            </div>
          </dl>
        </div>

        <div className="shrink-0 md:w-44">
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-xs font-medium text-muted-foreground"
          >
            Update status
          </label>
          <Select
            id={selectId}
            value={report.status}
            disabled={updating}
            onChange={(e) =>
              onStatusChange(e.target.value as ReportStatusValue)
            }
          >
            {REPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
      </article>
    </Card>
  );
}
