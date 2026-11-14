import { describe, expect, it } from "vitest";
import {
  createReportSchema,
  fieldErrors,
  reportFiltersSchema,
  signupSchema,
  updateStatusSchema,
} from "@/lib/validation";
import { PNG_DATA_URL } from "./helpers";

const validReport = {
  type: "EMERGENCY",
  specificType: "Fire Outbreak",
  title: "Smoke from warehouse",
  description:
    "Thick smoke is coming from the roof of the warehouse on River Road.",
  location: "River Road",
  latitude: 12.97,
  longitude: 77.59,
  image: PNG_DATA_URL,
};

describe("createReportSchema", () => {
  it("accepts a complete report", () => {
    expect(createReportSchema.safeParse(validReport).success).toBe(true);
  });

  it("accepts a minimal report and normalises empty location to null", () => {
    const result = createReportSchema.safeParse({
      type: "NON_EMERGENCY",
      specificType: "Other",
      title: "  Broken lights  ",
      description: "All street lights on the path are broken.",
      location: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.location).toBeNull();
      expect(result.data.title).toBe("Broken lights");
    }
  });

  it("returns friendly per-field errors", () => {
    const result = createReportSchema.safeParse({
      title: "Hi",
      description: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.type).toMatch(/emergency/i);
      expect(errors.specificType).toMatch(/category/i);
      expect(errors.title).toMatch(/at least 5/);
      expect(errors.description).toMatch(/at least 20/);
    }
  });

  it("rejects unknown categories and out-of-range coordinates", () => {
    expect(
      createReportSchema.safeParse({ ...validReport, specificType: "Hacking" })
        .success,
    ).toBe(false);
    expect(
      createReportSchema.safeParse({ ...validReport, latitude: 91 }).success,
    ).toBe(false);
    expect(
      createReportSchema.safeParse({ ...validReport, longitude: -181 }).success,
    ).toBe(false);
  });

  it("rejects invalid images", () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      image: "data:text/html;base64,PGh0bWw+",
    });
    expect(result.success).toBe(false);
  });

  it("ignores client-supplied status and reportId", () => {
    const result = createReportSchema.safeParse({
      ...validReport,
      status: "RESOLVED",
      reportId: "x",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("status");
      expect(result.data).not.toHaveProperty("reportId");
    }
  });
});

describe("signupSchema", () => {
  it("normalises email and strips unknown fields such as role", () => {
    const result = signupSchema.safeParse({
      name: "Sam",
      email: "  Sam@Example.COM ",
      password: "password123",
      role: "ADMIN",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("sam@example.com");
      expect(result.data).not.toHaveProperty("role");
    }
  });

  it("rejects short passwords and invalid emails", () => {
    const result = signupSchema.safeParse({
      name: "Sam",
      email: "nope",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(errors.email).toBeDefined();
      expect(errors.password).toMatch(/8 characters/);
    }
  });
});

describe("status and filter schemas", () => {
  it("only allows known statuses", () => {
    expect(updateStatusSchema.safeParse({ status: "RESOLVED" }).success).toBe(
      true,
    );
    expect(updateStatusSchema.safeParse({ status: "DELETED" }).success).toBe(
      false,
    );
  });

  it("validates dashboard filters", () => {
    expect(reportFiltersSchema.safeParse({}).success).toBe(true);
    expect(
      reportFiltersSchema.safeParse({ status: "PENDING", type: "EMERGENCY" })
        .success,
    ).toBe(true);
    expect(
      reportFiltersSchema.safeParse({ status: "'; DROP TABLE" }).success,
    ).toBe(false);
  });
});
