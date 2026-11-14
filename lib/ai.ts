import { REPORT_CATEGORIES, type ReportCategory } from "./constants";
import type { ParsedImage } from "./image";

export type ImageAnalysis = {
  title: string;
  reportType: ReportCategory;
  description: string;
};

export const ANALYSIS_PROMPT = `You are helping someone file an incident report from a photo.
Respond in exactly this format, plain text, no markdown, asterisks or bullet points:
TITLE: a clear, brief title (max 12 words)
TYPE: exactly one of ${REPORT_CATEGORIES.join(", ")}
DESCRIPTION: a factual, concise description of what is visible (2-4 sentences)`;

/** Maps free-form model output onto one of the known categories. */
export function normalizeCategory(raw: string | undefined): ReportCategory {
  const value = (raw ?? "").trim().toLowerCase();
  if (!value) return "Other";
  const exact = REPORT_CATEGORIES.find((c) => c.toLowerCase() === value);
  if (exact) return exact;
  const partial = REPORT_CATEGORIES.find(
    (c) =>
      c !== "Other" &&
      (value.includes(c.toLowerCase()) || c.toLowerCase().includes(value)),
  );
  if (partial) return partial;
  if (/\bfire|smoke|burn/.test(value)) return "Fire Outbreak";
  if (/medical|injur|accident|health/.test(value)) return "Medical Emergency";
  if (/flood|earthquake|storm|landslide|cyclone/.test(value))
    return "Natural Disaster";
  if (/assault|fight|attack|weapon/.test(value)) return "Violence";
  if (/robbery|steal|burglar|shoplift/.test(value)) return "Theft";
  return "Other";
}

const stripMarkdown = (s: string) => s.replace(/[*_`#]+/g, "").trim();

/** Parses the model's `TITLE: / TYPE: / DESCRIPTION:` response. */
export function parseAnalysis(text: string): ImageAnalysis {
  const clean = text.replace(/\r\n/g, "\n");
  const title = /TITLE:\s*(.+)/i.exec(clean)?.[1];
  const type = /TYPE:\s*(.+)/i.exec(clean)?.[1];
  const description = /DESCRIPTION:\s*([\s\S]+)/i.exec(clean)?.[1];

  return {
    title: stripMarkdown(title ?? "").slice(0, 120),
    reportType: normalizeCategory(stripMarkdown(type ?? "")),
    description: stripMarkdown(description ?? "").slice(0, 5000),
  };
}

export function isAiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/** Sends the image to Gemini and returns a parsed analysis. */
export async function analyzeImage(image: ParsedImage): Promise<ImageAnalysis> {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: ANALYSIS_PROMPT },
          { inlineData: { data: image.base64, mimeType: image.mimeType } },
        ],
      },
    ],
  });
  return parseAnalysis(response.text ?? "");
}
