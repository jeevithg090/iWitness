import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import {
  isNotFoundError,
  jsonError,
  readJson,
  validationError,
} from "@/lib/api";
import { updateStatusSchema } from "@/lib/validation";

type Context = { params: Promise<{ reportId: string }> };

/** Staff-only: updates a report's status. `reportId` is the internal record id. */
export async function PATCH(request: Request, { params }: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { reportId } = await params;
  const parsed = updateStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status: parsed.data.status },
      select: { id: true, reportId: true, status: true, updatedAt: true },
    });
    return NextResponse.json(report);
  } catch (error) {
    if (isNotFoundError(error)) return jsonError("Report not found.", 404);
    console.error("Failed to update report:", error);
    return jsonError("Could not update the report. Please try again.", 500);
  }
}
