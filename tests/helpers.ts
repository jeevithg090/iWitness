import { vi } from "vitest";

export function jsonRequest(
  url: string,
  body: unknown,
  init: RequestInit = {},
) {
  return new Request(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}`,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...init,
  });
}

/** A tiny valid 1x1 PNG as a data URL. */
export const PNG_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export function prismaError(code: string) {
  return Object.assign(new Error(code), { code });
}

export const mockPrisma = {
  report: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};
