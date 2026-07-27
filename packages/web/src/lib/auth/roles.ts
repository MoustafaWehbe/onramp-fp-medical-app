export type AppRole = "admin" | "user";

export function isAppRole(value: string): value is AppRole {
  return value === "admin" || value === "user";
}

export function homePathForRole(role: string): string {
  return role === "admin" ? "/admin" : "/dashboard";
}
