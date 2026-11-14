import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import {
  isUniqueConstraintError,
  jsonError,
  readJson,
  tooManyRequests,
  validationError,
} from "@/lib/api";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validation";

const limiter = createRateLimiter({ limit: 5, windowMs: 15 * 60 * 1000 });

/**
 * Creates a USER account. The role is never taken from the request body:
 * staff roles are granted by an administrator (see `npm run user:role`).
 */
export async function POST(request: Request) {
  const rate = limiter(clientKey(request));
  if (!rate.allowed) return tooManyRequests(rate);

  const parsed = signupSchema.safeParse(await readJson(request));
  if (!parsed.success) return validationError(parsed.error);

  const { name, email, password } = parsed.data;

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: await bcrypt.hash(password, 12),
        role: "USER",
      },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return jsonError("An account with this email already exists.", 409, {
        fields: { email: "An account with this email already exists." },
      });
    }
    console.error("Signup failed:", error);
    return jsonError("Could not create your account. Please try again.", 500);
  }
}
