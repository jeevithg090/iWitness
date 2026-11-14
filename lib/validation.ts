import { z } from "zod";
import { REPORT_CATEGORIES, REPORT_STATUSES, REPORT_TYPES } from "./constants";
import { parseImageDataUrl } from "./image";

const imageDataUrl = z.string().superRefine((value, ctx) => {
  const result = parseImageDataUrl(value);
  if (!result.ok) ctx.addIssue({ code: "custom", message: result.error });
});

const optionalCoordinate = (min: number, max: number) =>
  z.number().min(min).max(max).nullable().optional();

export const createReportSchema = z.object({
  type: z.enum(REPORT_TYPES, {
    error: "Choose whether this is an emergency.",
  }),
  specificType: z.enum(REPORT_CATEGORIES, {
    error: "Choose an incident category.",
  }),
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(20, "Please describe what happened in at least 20 characters.")
    .max(5000, "Description must be 5,000 characters or fewer."),
  location: z
    .string()
    .trim()
    .max(300, "Location must be 300 characters or fewer.")
    .optional()
    .transform((value) => (value ? value : null)),
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
  image: imageDataUrl.nullable().optional(),
});

export type CreateReportInput = z.input<typeof createReportSchema>;

export const updateStatusSchema = z.object({
  status: z.enum(REPORT_STATUSES, { error: "Invalid report status." }),
});

export const reportFiltersSchema = z.object({
  status: z.enum(REPORT_STATUSES).optional(),
  type: z.enum(REPORT_TYPES).optional(),
});

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
  // bcrypt only uses the first 72 bytes of a password.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be 72 characters or fewer."),
});

export const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1).max(72),
});

export const analyzeImageSchema = z.object({ image: imageDataUrl });

/** Flattens zod issues into `{ field: firstMessage }` for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return errors;
}
