import type { Request } from "express";
import request from "supertest";
import { app } from "../../app";
import { createError } from "../../src/middleware/error-handler";

jest.mock("../../src/lib/db", () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getDatabase: jest.fn(),
}));

jest.mock("../../src/middleware/authenticate", () => ({
  ...jest.requireActual("../../src/middleware/authenticate"),
  authenticate: (req: Request, _res: unknown, next: () => void) => {
    req.user = {
      userId: "00000000-0000-0000-0000-000000000001",
      email: "test@example.com",
      role: "user",
      sessionId: "00000000-0000-0000-0000-000000000002",
    };
    next();
  },
}));

jest.mock("../../src/services/auth.service", () => ({
  authService: {
    updateEmail: jest.fn(),
    updatePassword: jest.fn(),
    deleteAccount: jest.fn(),
  },
}));

import { authService } from "../../src/services/auth.service";

const mockAuthService = authService as jest.Mocked<typeof authService>;

const USER_ID = "00000000-0000-0000-0000-000000000001";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("PATCH /api/users/me/email", () => {
  it("returns 200 with the updated email", async () => {
    mockAuthService.updateEmail.mockResolvedValue({
      id: USER_ID,
      email: "new@example.com",
      name: "Test User",
      role: "user",
    } as never);

    const res = await request(app)
      .patch("/api/users/me/email")
      .send({ currentPassword: "CurrentPass1", newEmail: "new@example.com" });

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe("new@example.com");
    expect(res.body.data.message).toBe("Email updated successfully.");
    expect(mockAuthService.updateEmail).toHaveBeenCalledWith(
      USER_ID,
      "CurrentPass1",
      "new@example.com",
    );
  });

  it("returns 422 when currentPassword is missing", async () => {
    const res = await request(app)
      .patch("/api/users/me/email")
      .send({ newEmail: "new@example.com" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPassword");
  });

  it("returns 422 when newEmail is invalid", async () => {
    const res = await request(app)
      .patch("/api/users/me/email")
      .send({ currentPassword: "CurrentPass1", newEmail: "not-an-email" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("newEmail");
  });

  it("returns 401 when the current password is incorrect", async () => {
    mockAuthService.updateEmail.mockRejectedValue(
      createError("Current password is incorrect", 401),
    );

    const res = await request(app)
      .patch("/api/users/me/email")
      .send({ currentPassword: "WrongPass1", newEmail: "new@example.com" });

    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/users/me/password", () => {
  it("returns 200 with a success message", async () => {
    mockAuthService.updatePassword.mockResolvedValue(undefined as never);

    const res = await request(app)
      .patch("/api/users/me/password")
      .send({ currentPassword: "CurrentPass1", newPassword: "NewPassw0rd" });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Password updated successfully.");
    expect(mockAuthService.updatePassword).toHaveBeenCalledWith(
      USER_ID,
      "CurrentPass1",
      "NewPassw0rd",
    );
  });

  it("returns 422 when currentPassword is missing", async () => {
    const res = await request(app)
      .patch("/api/users/me/password")
      .send({ newPassword: "NewPassw0rd" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPassword");
  });

  it("returns 422 when newPassword is too short", async () => {
    const res = await request(app)
      .patch("/api/users/me/password")
      .send({ currentPassword: "CurrentPass1", newPassword: "short" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("newPassword");
  });

  it("returns 422 when newPassword has no uppercase letter", async () => {
    const res = await request(app)
      .patch("/api/users/me/password")
      .send({ currentPassword: "CurrentPass1", newPassword: "nouppercase1" });

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("newPassword");
  });
});

describe("DELETE /api/users/me", () => {
  it("returns 200 with a success message", async () => {
    mockAuthService.deleteAccount.mockResolvedValue(undefined as never);

    const res = await request(app)
      .delete("/api/users/me")
      .send({ currentPassword: "CurrentPass1" });

    expect(res.status).toBe(200);
    expect(res.body.data.message).toBe("Account deleted successfully.");
    expect(mockAuthService.deleteAccount).toHaveBeenCalledWith(
      USER_ID,
      "CurrentPass1",
    );
  });

  it("returns 422 when currentPassword is missing", async () => {
    const res = await request(app).delete("/api/users/me").send({});

    expect(res.status).toBe(422);
    expect(res.body.errors[0].field).toBe("currentPassword");
  });

  it("returns 401 when the current password is incorrect", async () => {
    mockAuthService.deleteAccount.mockRejectedValue(
      createError("Current password is incorrect", 401),
    );

    const res = await request(app)
      .delete("/api/users/me")
      .send({ currentPassword: "WrongPass1" });

    expect(res.status).toBe(401);
  });
});
