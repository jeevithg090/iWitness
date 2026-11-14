import prisma from "@/lib/prisma";
import { getStaffSession } from "@/lib/auth";
import { jsonError } from "@/lib/api";
import { parseImageDataUrl } from "@/lib/image";

type Context = { params: Promise<{ reportId: string }> };

/** Staff-only: streams a report's evidence image as binary (internal record id). */
export async function GET(_request: Request, { params }: Context) {
  const session = await getStaffSession();
  if (!session) return jsonError("Unauthorized", 401);

  const { reportId } = await params;
  const report = await prisma.report.findUnique({
    where: { id: reportId },
    select: { image: true },
  });
  if (!report?.image) return jsonError("Image not found.", 404);

  const parsed = parseImageDataUrl(report.image, Number.POSITIVE_INFINITY);
  if (!parsed.ok) return jsonError("Stored image is invalid.", 500);

  return new Response(Buffer.from(parsed.image.base64, "base64"), {
    headers: {
      "Content-Type": parsed.image.mimeType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
