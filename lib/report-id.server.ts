import { randomBytes } from "node:crypto";

/**
 * Generates an unguessable public tracking ID for a report. Generated on the
 * server so clients can never choose (or collide with) another report's ID.
 */
export function generateReportId(): string {
  return randomBytes(8).toString("hex");
}
