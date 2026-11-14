import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { ReportForm } from "@/components/report/report-form";
import { isAiConfigured } from "@/lib/ai";

export const metadata: Metadata = {
  title: "Submit a report",
  description:
    "File an anonymous incident report. No account or personal details required.",
};

export const dynamic = "force-dynamic";

export default function SubmitReportPage() {
  return (
    <div className="container py-12 sm:py-16">
      <PageHeader
        eyebrow="Secure & anonymous"
        eyebrowIcon={<Lock aria-hidden="true" />}
        title="Submit an anonymous report"
        description="No name, email or account needed. Fields marked * are required."
      />
      <Card className="mx-auto mt-10 max-w-2xl p-5 sm:p-8">
        <ReportForm aiEnabled={isAiConfigured()} />
      </Card>
    </div>
  );
}
