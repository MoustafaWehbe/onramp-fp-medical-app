import type { Response } from "express";

const ACCESS_COOKIE = "accessToken";
const REFRESH_COOKIE = "refreshToken";

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_COOKIE, { path: "/api" });
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth/refresh" });
}
