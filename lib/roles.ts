import { STAFF_ROLES, type RoleValue } from "./constants";

export function isStaffRole(role: string | null | undefined): boolean {
  return (
    !!role && (STAFF_ROLES as readonly string[]).includes(role as RoleValue)
  );
}
