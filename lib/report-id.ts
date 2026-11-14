/** Public report IDs are 16 lowercase hex characters (64 bits of randomness). */
export const REPORT_ID_PATTERN = /^[a-f0-9]{16}$/;

export function normalizeReportId(input: string): string {
  return input.trim().toLowerCase();
}

export function isValidReportId(input: string): boolean {
  return REPORT_ID_PATTERN.test(input);
}
