import { describe, expect, it } from "vitest";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit and then blocks until the window resets", () => {
    let now = 0;
    const check = createRateLimiter({
      limit: 2,
      windowMs: 1000,
      now: () => now,
    });

    expect(check("a").allowed).toBe(true);
    expect(check("a").allowed).toBe(true);
    const blocked = check("a");
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(1);

    // Other clients are unaffected.
    expect(check("b").allowed).toBe(true);

    now = 1000;
    expect(check("a").allowed).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.1.1.1, 2.2.2.2" },
    });
    expect(clientKey(req)).toBe("1.1.1.1");
  });

  it("falls back when no proxy headers are present", () => {
    expect(clientKey(new Request("http://x"))).toBe("unknown");
  });
});
