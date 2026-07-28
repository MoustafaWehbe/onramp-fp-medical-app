export type AppRole = "admin" | "user";

export function isAppRole(value: string): value is AppRole {
  return value === "admin" || value === "user";
}

export function homePathForRole(role: AppRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "user":
      return "/dashboard";
    default:
      throw new Error(`Unsupported role: ${String(role)}`);
  }
}
