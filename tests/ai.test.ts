import { describe, expect, it } from "vitest";
import { normalizeCategory, parseAnalysis } from "@/lib/ai";

describe("parseAnalysis", () => {
  it("parses the expected response format", () => {
    const text = `TITLE: House fire on Elm Street
TYPE: Fire Outbreak
DESCRIPTION: Flames are visible from the upstairs windows.
Smoke is spreading to the neighbouring house.`;
    expect(parseAnalysis(text)).toEqual({
      title: "House fire on Elm Street",
      reportType: "Fire Outbreak",
      description:
        "Flames are visible from the upstairs windows.\nSmoke is spreading to the neighbouring house.",
    });
  });

  it("tolerates markdown, casing and CRLF line endings", () => {
    const text =
      "**Title:** Car crash\r\n**type:** medical emergency\r\n**Description:** Two cars collided.";
    const result = parseAnalysis(text);
    expect(result.title).toBe("Car crash");
    expect(result.reportType).toBe("Medical Emergency");
    expect(result.description).toBe("Two cars collided.");
  });

  it("returns empty fields and Other for unparseable output", () => {
    expect(parseAnalysis("I cannot help with that.")).toEqual({
      title: "",
      reportType: "Other",
      description: "",
    });
  });

  it("truncates overly long titles", () => {
    expect(parseAnalysis(`TITLE: ${"a".repeat(500)}`).title).toHaveLength(120);
  });
});

describe("normalizeCategory", () => {
  it.each([
    ["Theft", "Theft"],
    ["theft", "Theft"],
    ["Armed robbery", "Theft"],
    ["Smoke and fire", "Fire Outbreak"],
    ["Flooding", "Natural Disaster"],
    ["Physical assault", "Violence"],
    ["Road accident with injuries", "Medical Emergency"],
    ["Graffiti", "Other"],
    ["", "Other"],
  ])("maps %j to %j", (input, expected) => {
    expect(normalizeCategory(input)).toBe(expected);
  });
});
