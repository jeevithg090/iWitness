import { describe, expect, it } from "vitest";
import { isStaffRole } from "@/lib/roles";

describe("isStaffRole", () => {
  it.each([
    ["ADMIN", true],
    ["MODERATOR", true],
    ["USER", false],
    ["admin", false],
    [undefined, false],
    [null, false],
  ])("%j -> %j", (role, expected) => expect(isStaffRole(role)).toBe(expected));
});
