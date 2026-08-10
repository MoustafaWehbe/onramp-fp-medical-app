import type { Request } from "express";
import request from "supertest";
import { app } from "../../app";

// Mock the DB so we don't need a real database in unit tests
jest.mock("../../src/lib/db", () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn(),
}));

jest.mock("../../src/middleware/authenticate", () => ({
  ...jest.requireActual("../../src/middleware/authenticate"),
  authenticate: (req: Request, _res: unknown, next: () => void) => {
    req.user = {
      userId: "00000000-0000-0000-0000-000000000001",
      email: "alice@example.com",
      role: "user",
      sessionId: "00000000-0000-0000-0000-000000000002",
    };
    next();
  },
}));

jest.mock("../../src/services/auth.service", () => ({
  authService: {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    getProfile: jest.fn(),
  },
}));

import { authService } from "../../src/services/auth.service";
const mockAuthService = authService as jest.Mocked<typeof authService>;

beforeEach(() => {
  jest.clearAllMocks();
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("returns 201 with user data on success", async () => {
    mockAuthService.register.mockResolvedValue({
      id: "uuid-1",
      email: "alice@example.com",
      name: "Alice",
      role: "user",
    });

    const res = await request(app).post("/api/auth/register").send({
      email: "alice@example.com",
      password: "SecurePass1",
      name: "Alice",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.email).toBe("alice@example.com");
  });

  it("returns 422 when email is invalid", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      password: "SecurePass1",
      name: "Alice",
    });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("email");
  });

  it("returns 422 when password is too weak", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "alice@example.com",
      password: "short",
      name: "Alice",
    });

    expect(res.status).toBe(422);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("returns 200 with tokens on valid credentials", async () => {
    mockAuthService.login.mockResolvedValue({
      user: {
        id: "uuid-1",
        email: "alice@example.com",
        name: "Alice",
        role: "user",
      },
      accessToken: "access.token.here",
      refreshToken: "refresh.token.here",
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@example.com", password: "SecurePass1" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("alice@example.com");
    const cookies = res.headers["set-cookie"] as string[];
    const accessCookie = cookies.find((c) => c.startsWith("accessToken="));
    const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="));
    expect(accessCookie).toBeDefined();
    expect(refreshCookie).toBeDefined();
    expect(accessCookie).toContain("accessToken=access.token.here");
    expect(accessCookie).toContain("HttpOnly");
    expect(accessCookie).toContain("SameSite=Lax");
    expect(accessCookie).toContain("Path=/api");
    expect(refreshCookie).toContain("refreshToken=refresh.token.here");
    expect(refreshCookie).toContain("HttpOnly");
    expect(refreshCookie).toContain("SameSite=Lax");
    expect(refreshCookie).toContain("Path=/api/auth/refresh");
  });

  it("returns 422 when body is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(422);
  });
});

// ─── POST /api/auth/refresh ───────────────────────────────────────────────────

describe("POST /api/auth/refresh", () => {
  it("returns 200 with a refreshed message", async () => {
    mockAuthService.refresh.mockResolvedValue({
      accessToken: "new.access.token",
      refreshToken: "new.refresh.token",
    });

    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", ["refreshToken=some-valid-refresh-token"]);

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Token refreshed");
    expect(mockAuthService.refresh).toHaveBeenCalledWith(
      "some-valid-refresh-token",
    );
  });

  it("returns 401 when the refresh cookie is missing", async () => {
    const res = await request(app).post("/api/auth/refresh");

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Missing refresh token");
    expect(mockAuthService.refresh).not.toHaveBeenCalled();
  });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────

describe("POST /api/auth/logout", () => {
  it("returns 200 with a success message", async () => {
    mockAuthService.logout.mockResolvedValue(undefined as never);

    const res = await request(app).post("/api/auth/logout");

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Logged out successfully");
    expect(mockAuthService.logout).toHaveBeenCalledWith(
      "00000000-0000-0000-0000-000000000002",
    );
    const cookies = res.headers["set-cookie"] as string[];
    expect(cookies.find((c) => c.startsWith("accessToken="))).toMatch(
      /^accessToken=;/,
    );
    expect(cookies.find((c) => c.startsWith("refreshToken="))).toMatch(
      /^refreshToken=;/,
    );
  });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  it("returns 200 with the current user", async () => {
    mockAuthService.getProfile.mockResolvedValue({
      id: "00000000-0000-0000-0000-000000000001",
      email: "alice@example.com",
      name: "Alice",
      role: "user",
    });

    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("alice@example.com");
    expect(mockAuthService.getProfile).toHaveBeenCalledWith(
      "00000000-0000-0000-0000-000000000001",
    );
  });
});
