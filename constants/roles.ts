export const ROLES = {
  Admin: "Admin",
  Staff: "Staff",
  Customer: "Customer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function hasAnyRole(userRoles: readonly string[] | undefined, allowed: readonly Role[]): boolean {
  if (!userRoles || userRoles.length === 0 || allowed.length === 0) return false;
  return userRoles.some((role) => (allowed as readonly string[]).includes(role));
}
