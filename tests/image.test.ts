import { describe, expect, it } from "vitest";
import { base64ByteLength, parseImageDataUrl } from "@/lib/image";
import { PNG_DATA_URL } from "./helpers";

describe("parseImageDataUrl", () => {
  it("accepts a valid PNG data URL", () => {
    const result = parseImageDataUrl(PNG_DATA_URL);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.image.mimeType).toBe("image/png");
      expect(result.image.bytes).toBe(
        Buffer.from(result.image.base64, "base64").length,
      );
    }
  });

  it("rejects non-image and disallowed types", () => {
    expect(parseImageDataUrl("data:image/svg+xml;base64,PHN2Zz4=").ok).toBe(
      false,
    );
    expect(parseImageDataUrl("data:text/html;base64,PGh0bWw+").ok).toBe(false);
  });

  it("rejects strings that are not base64 data URLs", () => {
    expect(parseImageDataUrl("https://example.com/cat.png").ok).toBe(false);
    expect(parseImageDataUrl("data:image/png;base64,not base64!").ok).toBe(
      false,
    );
  });

  it("enforces the size limit", () => {
    const result = parseImageDataUrl(PNG_DATA_URL, 10);
    expect(result).toEqual({
      ok: false,
      error: expect.stringMatching(/too large/),
    });
  });
});

describe("base64ByteLength", () => {
  it.each(["", "a", "ab", "abc", "hello world", "x".repeat(1000)])(
    "matches Buffer length for %j",
    (s) => {
      const b64 = Buffer.from(s).toString("base64");
      expect(base64ByteLength(b64)).toBe(Buffer.byteLength(s));
    },
  );
});
