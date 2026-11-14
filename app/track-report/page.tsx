import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReportTracker } from "@/components/report/report-tracker";

export const metadata: Metadata = {
  title: "Track a report",
  description:
    "Check the status of an anonymous report using your private report ID.",
};

export default async function TrackReportPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const { id } = await searchParams;
  const initialId = typeof id === "string" ? id : "";

  return (
    <div className="container py-12 sm:py-16">
      <PageHeader
        eyebrow="Track your report"
        eyebrowIcon={<Search aria-hidden="true" />}
        title="Check your report status"
        description="Enter the report ID you received after submitting to see where it stands."
      />
      <div className="mt-10">
        <ReportTracker initialId={initialId} />
      </div>
    </div>
  );
}
