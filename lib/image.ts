import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "./constants";

export type ParsedImage = {
  mimeType: (typeof ALLOWED_IMAGE_TYPES)[number];
  base64: string;
  bytes: number;
};

export type ImageParseResult =
  { ok: true; image: ParsedImage } | { ok: false; error: string };

const DATA_URL_PATTERN =
  /^data:([a-z]+\/[a-z0-9.+-]+);base64,([A-Za-z0-9+/]+={0,2})$/;

/** Decoded byte length of a base64 string without allocating a buffer. */
export function base64ByteLength(base64: string): number {
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/** Validates a `data:image/...;base64,...` URL: type allow-list and size limit. */
export function parseImageDataUrl(
  dataUrl: string,
  maxBytes: number = MAX_IMAGE_BYTES,
): ImageParseResult {
  const match = DATA_URL_PATTERN.exec(dataUrl);
  if (!match) {
    return { ok: false, error: "Image must be a base64-encoded data URL." };
  }

  const [, mimeType, base64] = match;
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)) {
    return {
      ok: false,
      error: "Unsupported image type. Use JPEG, PNG, WebP or GIF.",
    };
  }

  const bytes = base64ByteLength(base64);
  if (bytes > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    return { ok: false, error: `Image is too large (max ${limitMb} MB).` };
  }

  return {
    ok: true,
    image: {
      mimeType: mimeType as ParsedImage["mimeType"],
      base64,
      bytes,
    },
  };
}
