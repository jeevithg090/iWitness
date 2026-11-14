import { NextResponse } from "next/server";
import type { z } from "zod";
import { fieldErrors } from "./validation";
import type { RateLimitResult } from "./rate-limit";

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function validationError(error: z.ZodError) {
  return jsonError("Please fix the highlighted fields.", 400, {
    fields: fieldErrors(error),
  });
}

export function tooManyRequests(result: RateLimitResult) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSeconds) },
    },
  );
}

/** Reads a JSON body, returning `undefined` instead of throwing on bad input. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

/** Prisma "record not found" error code. */
export function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2025"
  );
}

export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}
