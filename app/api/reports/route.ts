import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { reportFiltersSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** Maximum number of reports returned to the dashboard in one request. */
const MAX_RESULTS = 200;

/** Staff-only: lists reports, newest first. Images are served separately. */
export async function GET(request: Request) {
  const session = await getStaffSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const filters = reportFiltersSchema.safeParse({
    status: searchParams.get("status") || undefined,
    type: searchParams.get("type") || undefined,
  });
  if (!filters.success) return jsonError("Invalid filter.", 400);

  const where = {
    ...(filters.data.status && { status: filters.data.status }),
    ...(filters.data.type && { type: filters.data.type }),
  };

  try {
    const [reports, withImages] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: MAX_RESULTS,
        select: {
          id: true,
          reportId: true,
          type: true,
          reportType: true,
          title: true,
          description: true,
          location: true,
          latitude: true,
          longitude: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.report.findMany({
        where: { ...where, image: { not: null } },
        orderBy: { createdAt: "desc" },
        take: MAX_RESULTS,
        select: { id: true },
      }),
    ]);

    const imageIds = new Set(withImages.map((r) => r.id));
    return NextResponse.json(
      reports.map((report) => ({
        ...report,
        hasImage: imageIds.has(report.id),
      })),
    );
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return jsonError("Could not load reports. Please try again.", 503);
  }
}
