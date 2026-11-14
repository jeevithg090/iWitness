import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  isUniqueConstraintError,
  jsonError,
  readJson,
  tooManyRequests,
  validationError,
} from "@/lib/api";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { generateReportId } from "@/lib/report-id.server";
import { createReportSchema } from "@/lib/validation";

const limiter = createRateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 });

/** Public endpoint: files an anonymous report and returns its tracking ID. */
export async function POST(request: Request) {
  const rate = limiter(clientKey(request));
  if (!rate.allowed) return tooManyRequests(rate);

  const parsed = createReportSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  const data = parsed.data;

  // Retry on the (astronomically unlikely) event of an ID collision.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const report = await prisma.report.create({
        data: {
          reportId: generateReportId(),
          type: data.type,
          reportType: data.specificType,
          title: data.title,
          description: data.description,
          location: data.location,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          image: data.image ?? null,
          status: "PENDING",
        },
        select: { reportId: true },
      });

      return NextResponse.json(
        {
          success: true,
          reportId: report.reportId,
          message: "Report submitted successfully",
        },
        { status: 201 },
      );
    } catch (error) {
      if (isUniqueConstraintError(error)) continue;
      console.error("Failed to create report:", error);
      return jsonError(
        "We couldn't submit your report. Please try again.",
        500,
      );
    }
  }

  return jsonError("We couldn't submit your report. Please try again.", 500);
}
