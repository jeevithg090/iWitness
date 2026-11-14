/** Incident categories a reporter can choose from (also used to normalise AI output). */
export const REPORT_CATEGORIES = [
  "Theft",
  "Fire Outbreak",
  "Medical Emergency",
  "Natural Disaster",
  "Violence",
  "Other",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export const REPORT_TYPES = ["EMERGENCY", "NON_EMERGENCY"] as const;
export type ReportTypeValue = (typeof REPORT_TYPES)[number];

export const REPORT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "RESOLVED",
  "DISMISSED",
] as const;
export type ReportStatusValue = (typeof REPORT_STATUSES)[number];

export const ROLES = ["ADMIN", "MODERATOR", "USER"] as const;
export type RoleValue = (typeof ROLES)[number];

/** Roles allowed to view and triage reports in the dashboard. */
export const STAFF_ROLES: readonly RoleValue[] = ["ADMIN", "MODERATOR"];

/** Maximum decoded size of an attached evidence image. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const STATUS_LABELS: Record<ReportStatusValue, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const TYPE_LABELS: Record<ReportTypeValue, string> = {
  EMERGENCY: "Emergency",
  NON_EMERGENCY: "Non-emergency",
};

export const EMERGENCY_NUMBER = "112";
