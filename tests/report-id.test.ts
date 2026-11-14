import { describe, expect, it } from "vitest";
import { isValidReportId, normalizeReportId } from "@/lib/report-id";
import { generateReportId } from "@/lib/report-id.server";

describe("report IDs", () => {
  it("generates 16-character lowercase hex IDs", () => {
    const id = generateReportId();
    expect(id).toMatch(/^[a-f0-9]{16}$/);
    expect(isValidReportId(id)).toBe(true);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 1000 }, generateReportId));
    expect(ids.size).toBe(1000);
  });

  it("normalises whitespace and case before validating", () => {
    expect(normalizeReportId("  ABCDEF0123456789 ")).toBe("abcdef0123456789");
  });

  it.each([
    "",
    "abc",
    "zzzzzzzzzzzzzzzz",
    "abcdef01234567890",
    "../../etc/passwd",
  ])("rejects invalid ID %j", (value) =>
    expect(isValidReportId(value)).toBe(false),
  );
});
