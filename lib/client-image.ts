import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "./constants";

const MAX_DIMENSION = 1600;

/**
 * Reads an image file in the browser and re-encodes it as JPEG through a canvas.
 * Re-encoding strips EXIF metadata (which can include GPS coordinates and device
 * details) and downscales large photos so uploads stay small. GIFs are passed
 * through unchanged to keep animation. Returns a `data:` URL for the API.
 */
export async function prepareImage(file: File): Promise<string> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    throw new Error("Please choose a JPEG, PNG, WebP or GIF image.");
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new Error("That image is over 20 MB. Please choose a smaller one.");
  }

  const original = await readAsDataUrl(file);
  if (file.type === "image/gif" && file.size <= MAX_IMAGE_BYTES)
    return original;

  const img = await loadImage(original);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process that image.");
  // JPEG has no transparency: paint a white background first.
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(new Error("That file doesn't look like a valid image."));
    img.src = src;
  });
}
