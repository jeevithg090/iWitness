import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { jsonError, tooManyRequests } from "@/lib/api";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { isValidReportId, normalizeReportId } from "@/lib/report-id";

export const dynamic = "force-dynamic";

const limiter = createRateLimiter({ limit: 30, windowMs: 60 * 1000 });

type Context = { params: Promise<{ reportId: string }> };

/**
 * Public status lookup by tracking ID. Only non-identifying fields are returned:
 * the location, coordinates, description and image stay staff-only so a leaked
 * ID cannot be used to learn where the reporter was.
 */
export async function GET(request: Request, { params }: Context) {
  const rate = limiter(clientKey(request));
  if (!rate.allowed) return tooManyRequests(rate);

  const reportId = normalizeReportId((await params).reportId);
  if (!isValidReportId(reportId)) {
    return jsonError("Report IDs are 16 characters (0-9, a-f).", 400);
  }

  try {
    const report = await prisma.report.findUnique({
      where: { reportId },
      select: {
        reportId: true,
        type: true,
        reportType: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!report) return jsonError("Report not found.", 404);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to fetch report details:", error);
    return jsonError("Could not look up the report. Please try again.", 503);
  }
}
