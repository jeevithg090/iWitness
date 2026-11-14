import { NextResponse } from "next/server";
import { analyzeImage, isAiConfigured } from "@/lib/ai";
import {
  jsonError,
  readJson,
  tooManyRequests,
  validationError,
} from "@/lib/api";
import { parseImageDataUrl } from "@/lib/image";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { analyzeImageSchema } from "@/lib/validation";

const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

/** Uses Gemini to suggest a title, category and description for a photo. */
export async function POST(request: Request) {
  if (!isAiConfigured()) {
    return jsonError("Image analysis is not configured on this server.", 503);
  }

  const rate = limiter(clientKey(request));
  if (!rate.allowed) return tooManyRequests(rate);

  const parsed = analyzeImageSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  const image = parseImageDataUrl(parsed.data.image);
  if (!image.ok) return jsonError(image.error, 400);

  try {
    const analysis = await analyzeImage(image.image);
    if (!analysis.title && !analysis.description) {
      return jsonError(
        "Could not understand this image. Please fill in the details manually.",
        422,
      );
    }
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Image analysis failed:", error);
    return jsonError(
      "Image analysis failed. You can still fill in the details manually.",
      502,
    );
  }
}
