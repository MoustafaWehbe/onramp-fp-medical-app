import { hashPassword, verifyPassword } from "../../../shared/auth/password";
import { signAccessToken, verifyAccessToken } from "../../../shared/auth/jwt";
import { Op } from "sequelize";
import {
  generateTokenPair as mockGenerateTokenPair,
  hashPassword as mockHashPassword,
  verifyPassword as mockVerifyPassword,
  verifyRefreshToken as mockVerifyRefreshToken,
} from "@starter-kit/shared";
import {
  DailyEntry,
  EntryCondition,
  EntryDoctorVisit,
  EntryMedication,
  EntrySymptom,
  RefreshToken,
  Session,
  User,
  UserClinic,
  UserCondition,
  UserDoctor,
  UserMedication,
  UserSymptom,
} from "../../src/models";
import { getDatabase } from "../../src/lib/db";
import { AuthService } from "../../src/services/auth.service";

jest.mock("@starter-kit/shared", () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
  generateTokenPair: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock("../../src/models", () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  Session: {
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
  },
  RefreshToken: {
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  DailyEntry: { findAll: jest.fn(), destroy: jest.fn() },
  EntryCondition: { destroy: jest.fn() },
  EntrySymptom: { destroy: jest.fn() },
  EntryMedication: { destroy: jest.fn() },
  EntryDoctorVisit: { destroy: jest.fn() },
  UserCondition: { destroy: jest.fn() },
  UserSymptom: { destroy: jest.fn() },
  UserMedication: { destroy: jest.fn() },
  UserDoctor: { destroy: jest.fn() },
  UserClinic: { destroy: jest.fn() },
}));

jest.mock("../../src/lib/db", () => ({
  getDatabase: jest.fn(),
}));

const mockUser = User as jest.Mocked<typeof User>;
const mockSession = Session as jest.Mocked<typeof Session>;
const mockRefreshToken = RefreshToken as jest.Mocked<typeof RefreshToken>;
const mockDailyEntry = DailyEntry as jest.Mocked<typeof DailyEntry>;
const mockEntryCondition = EntryCondition as jest.Mocked<typeof EntryCondition>;
const mockEntrySymptom = EntrySymptom as jest.Mocked<typeof EntrySymptom>;
const mockEntryMedication = EntryMedication as jest.Mocked<typeof EntryMedication>;
const mockEntryDoctorVisit = EntryDoctorVisit as jest.Mocked<
  typeof EntryDoctorVisit
>;
const mockUserCondition = UserCondition as jest.Mocked<typeof UserCondition>;
const mockUserSymptom = UserSymptom as jest.Mocked<typeof UserSymptom>;
const mockUserMedication = UserMedication as jest.Mocked<typeof UserMedication>;
const mockUserDoctor = UserDoctor as jest.Mocked<typeof UserDoctor>;
const mockUserClinic = UserClinic as jest.Mocked<typeof UserClinic>;
const mockGetDatabase = getDatabase as jest.Mocked<typeof getDatabase>;
const service = new AuthService();

const userId = "00000000-0000-0000-0000-000000000001";
const sessionId = "00000000-0000-0000-0000-000000000002";
const fakeTx = { isTransaction: true };
const userRecord = {
  id: userId,
  email: "alice@example.com",
  name: "Alice",
  role: "user",
  passwordHash: "hashed-password",
  update: jest.fn(async function (
    this: Record<string, unknown>,
    values: Record<string, unknown>,
  ) {
    Object.assign(this, values);
    return this;
  }),
} as unknown as User;
const storedToken = {
  tokenHash: "a-hash",
  isValid: true,
  sessionId,
  update: jest.fn().mockResolvedValue(undefined),
} as unknown as RefreshToken;

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(userRecord, {
    email: "alice@example.com",
    name: "Alice",
    role: "user",
    passwordHash: "hashed-password",
  });
  mockGetDatabase.mockReturnValue({
    transaction: jest.fn(async (cb: (txn: unknown) => unknown) => cb(fakeTx)),
  } as never);
});

// ─── Password utilities ───────────────────────────────────────────────────────

describe("hashPassword / verifyPassword", () => {
  it("hashes a password and verifies it correctly", async () => {
    const password = "MySecurePass1";
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(20);
    await expect(verifyPassword(password, hash)).resolves.toBe(true);
  });

  it("returns false for a wrong password", async () => {
    const hash = await hashPassword("correct-password");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("produces different hashes for the same password (salt uniqueness)", async () => {
    const password = "SamePassword1";
    const [hash1, hash2] = await Promise.all([
      hashPassword(password),
      hashPassword(password),
    ]);
    expect(hash1).not.toBe(hash2);
  });
});

// ─── JWT utilities ────────────────────────────────────────────────────────────

describe("signAccessToken / verifyAccessToken", () => {
  const payload = {
    userId: "user-uuid-123",
    email: "test@example.com",
    role: "user" as const,
    sessionId: "session-uuid-456",
  };

  it("signs and verifies a token successfully", () => {
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it("throws when verifying a tampered token", () => {
    const token = signAccessToken(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(() => verifyAccessToken(tampered)).toThrow();
  });
});

// ─── register ─────────────────────────────────────────────────────────────────

describe("AuthService.register", () => {
  it("throws 409 when the email is already in use", async () => {
    mockUser.findOne.mockResolvedValue(userRecord as never);

    const error = await service
      .register({ email: "alice@example.com", password: "SecurePass1", name: "Alice" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Email already in use",
      statusCode: 409,
    });
    expect(mockUser.create).not.toHaveBeenCalled();
  });

  it("hashes the password and creates the user", async () => {
    mockUser.findOne.mockResolvedValue(null);
    mockHashPassword.mockResolvedValue("hashed-password");
    mockUser.create.mockResolvedValue(userRecord as never);

    const result = await service.register({
      email: "alice@example.com",
      password: "SecurePass1",
      name: "Alice",
    });

    expect(mockHashPassword).toHaveBeenCalledWith("SecurePass1");
    expect(mockUser.create).toHaveBeenCalledWith({
      email: "alice@example.com",
      passwordHash: "hashed-password",
      name: "Alice",
    });
    expect(result).toEqual({
      id: userId,
      email: "alice@example.com",
      name: "Alice",
      role: "user",
    });
  });
});

// ─── login ────────────────────────────────────────────────────────────────────

describe("AuthService.login", () => {
  it("throws 401 when no user matches the email", async () => {
    mockUser.findOne.mockResolvedValue(null);

    const error = await service
      .login({ email: "nobody@example.com", password: "SecurePass1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Invalid credentials",
      statusCode: 401,
    });
    expect(mockSession.create).not.toHaveBeenCalled();
  });

  it("throws 401 when the password is incorrect", async () => {
    mockUser.findOne.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(false);

    const error = await service
      .login({ email: "alice@example.com", password: "WrongPass1" })
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Invalid credentials",
      statusCode: 401,
    });
    expect(mockSession.create).not.toHaveBeenCalled();
  });

  it("creates a session and refresh token and returns tokens", async () => {
    mockUser.findOne.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockSession.create.mockResolvedValue({ id: sessionId } as never);
    mockGenerateTokenPair.mockReturnValue({
      accessToken: "access.token.here",
      refreshToken: "refresh.token.here",
    } as never);
    mockRefreshToken.create.mockResolvedValue({} as never);

    const result = await service.login({
      email: "alice@example.com",
      password: "SecurePass1",
      userAgent: "jest",
      ipAddress: "127.0.0.1",
    });

    expect(mockSession.create).toHaveBeenCalledWith({
      userId,
      userAgent: "jest",
      ipAddress: "127.0.0.1",
      expiresAt: expect.any(Date),
    });
    expect(mockGenerateTokenPair).toHaveBeenCalledWith({
      userId,
      email: "alice@example.com",
      role: "user",
      sessionId,
    });
    expect(mockRefreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        sessionId,
        tokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    );
    expect(result).toEqual({
      user: {
        id: userId,
        email: "alice@example.com",
        name: "Alice",
        role: "user",
      },
      accessToken: "access.token.here",
      refreshToken: "refresh.token.here",
    });
  });
});

// ─── refresh ──────────────────────────────────────────────────────────────────

describe("AuthService.refresh", () => {
  it("throws 401 when the refresh token is not stored", async () => {
    mockRefreshToken.findOne.mockResolvedValue(null);

    const error = await service.refresh("raw-token").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Invalid or expired refresh token",
      statusCode: 401,
    });
  });

  it("throws 401 when the stored token is revoked", async () => {
    mockRefreshToken.findOne.mockResolvedValue({ ...storedToken, isValid: false });

    const error = await service.refresh("raw-token").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Invalid or expired refresh token",
      statusCode: 401,
    });
  });

  it("throws 404 when the user no longer exists", async () => {
    mockRefreshToken.findOne.mockResolvedValue(storedToken);
    mockVerifyRefreshToken.mockReturnValue({ userId } as never);
    mockUser.findByPk.mockResolvedValue(null);

    const error = await service.refresh("raw-token").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });

  it("throws 401 when the session no longer exists", async () => {
    mockRefreshToken.findOne.mockResolvedValue(storedToken);
    mockVerifyRefreshToken.mockReturnValue({ userId } as never);
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockSession.findByPk.mockResolvedValue(null);

    const error = await service.refresh("raw-token").catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Session not found",
      statusCode: 401,
    });
  });

  it("revokes the stored token and rotates in a new refresh token", async () => {
    mockRefreshToken.findOne.mockResolvedValue(storedToken);
    mockVerifyRefreshToken.mockReturnValue({ userId } as never);
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockSession.findByPk.mockResolvedValue({ id: sessionId } as never);
    mockGenerateTokenPair.mockReturnValue({
      accessToken: "new.access.token",
      refreshToken: "new.refresh.token",
    } as never);
    mockRefreshToken.create.mockResolvedValue({} as never);

    const result = await service.refresh("raw-token");

    expect(storedToken.update).toHaveBeenCalledWith({ revokedAt: expect.any(Date) });
    expect(mockRefreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        sessionId,
        tokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    );
    expect(result).toEqual({
      accessToken: "new.access.token",
      refreshToken: "new.refresh.token",
    });
  });
});

// ─── logout ───────────────────────────────────────────────────────────────────

describe("AuthService.logout", () => {
  it("revokes refresh tokens and destroys the session", async () => {
    await service.logout(sessionId);

    expect(mockRefreshToken.update).toHaveBeenCalledWith(
      { revokedAt: expect.any(Date) },
      { where: { sessionId } },
    );
    expect(mockSession.destroy).toHaveBeenCalledWith({ where: { id: sessionId } });
  });
});

// ─── getProfile ───────────────────────────────────────────────────────────────

describe("AuthService.getProfile", () => {
  it("returns the user profile", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);

    const result = await service.getProfile(userId);

    expect(mockUser.findByPk).toHaveBeenCalledWith(userId, {
      attributes: ["id", "email", "name", "role", "emailVerified", "createdAt"],
    });
    expect(result).toEqual(userRecord);
  });

  it("throws 404 when the user is not found", async () => {
    mockUser.findByPk.mockResolvedValue(null);

    const error = await service.getProfile(userId).catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "User not found",
      statusCode: 404,
    });
  });
});

// ─── updateEmail ──────────────────────────────────────────────────────────────

describe("AuthService.updateEmail", () => {
  const currentPassword = "SecurePass1";

  it("throws 404 when the user is not found", async () => {
    mockUser.findByPk.mockResolvedValue(null);

    const error = await service
      .updateEmail(userId, currentPassword, "new@example.com")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({ message: "User not found", statusCode: 404 });
  });

  it("throws 401 when the current password is incorrect", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(false);

    const error = await service
      .updateEmail(userId, "WrongPass1", "new@example.com")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Current password is incorrect",
      statusCode: 401,
    });
  });

  it("throws 422 when the new email matches the current email", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);

    const error = await service
      .updateEmail(userId, currentPassword, "ALICE@example.com")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "New email must be different from current email",
      statusCode: 422,
    });
  });

  it("throws 409 when the new email is already in use", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockUser.findOne.mockResolvedValue(userRecord as never);

    const error = await service
      .updateEmail(userId, currentPassword, "bob@example.com")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Email is already in use",
      statusCode: 409,
    });
  });

  it("updates the user email on success", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockUser.findOne.mockResolvedValue(null);

    const result = await service.updateEmail(
      userId,
      currentPassword,
      "bob@example.com",
    );

    expect(userRecord.update).toHaveBeenCalledWith({ email: "bob@example.com" });
    expect(result).toEqual({
      id: userId,
      email: "bob@example.com",
      name: "Alice",
      role: "user",
    });
  });
});

// ─── updatePassword ───────────────────────────────────────────────────────────

describe("AuthService.updatePassword", () => {
  it("throws 404 when the user is not found", async () => {
    mockUser.findByPk.mockResolvedValue(null);

    const error = await service
      .updatePassword(userId, "SecurePass1", "NewPass1")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({ message: "User not found", statusCode: 404 });
  });

  it("throws 401 when the current password is incorrect", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(false);

    const error = await service
      .updatePassword(userId, "WrongPass1", "NewPass1")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Current password is incorrect",
      statusCode: 401,
    });
  });

  it("throws 422 when the new password matches the current password", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);

    const error = await service
      .updatePassword(userId, "SecurePass1", "SecurePass1")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "New password must be different from current password",
      statusCode: 422,
    });
  });

  it("updates the password and revokes existing sessions", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockHashPassword.mockResolvedValue("new-hash");

    await service.updatePassword(userId, "SecurePass1", "NewPass1");

    expect(mockHashPassword).toHaveBeenCalledWith("NewPass1");
    expect(userRecord.update).toHaveBeenCalledWith({ passwordHash: "new-hash" });
    expect(mockRefreshToken.update).toHaveBeenCalledWith(
      { revokedAt: expect.any(Date) },
      { where: { userId } },
    );
    expect(mockSession.destroy).toHaveBeenCalledWith({ where: { userId } });
  });
});

// ─── deleteAccount ────────────────────────────────────────────────────────────

describe("AuthService.deleteAccount", () => {
  it("throws 401 when the current password is incorrect", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(false);

    const error = await service
      .deleteAccount(userId, "WrongPass1")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Current password is incorrect",
      statusCode: 401,
    });
  });

  it("deletes the account and all related data inside a transaction", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockDailyEntry.findAll.mockResolvedValue([{ id: "entry-1" } as never]);
    mockEntryCondition.destroy.mockResolvedValue(1 as never);
    mockEntrySymptom.destroy.mockResolvedValue(1 as never);
    mockEntryMedication.destroy.mockResolvedValue(1 as never);
    mockEntryDoctorVisit.destroy.mockResolvedValue(1 as never);
    mockDailyEntry.destroy.mockResolvedValue(1 as never);
    mockUserCondition.destroy.mockResolvedValue(1 as never);
    mockUserSymptom.destroy.mockResolvedValue(1 as never);
    mockUserMedication.destroy.mockResolvedValue(1 as never);
    mockUserDoctor.destroy.mockResolvedValue(1 as never);
    mockUserClinic.destroy.mockResolvedValue(1 as never);
    mockRefreshToken.destroy.mockResolvedValue(1 as never);
    mockSession.destroy.mockResolvedValue(1 as never);
    mockUser.destroy.mockResolvedValue(1 as never);

    await service.deleteAccount(userId, "SecurePass1");

    expect(mockGetDatabase).toHaveBeenCalled();
    expect(mockUser.findByPk).toHaveBeenCalledWith(
      userId,
      { transaction: fakeTx, lock: true },
    );
    expect(mockEntryCondition.destroy).toHaveBeenCalledWith({
      where: { entryId: { [Op.in]: ["entry-1"] } },
      transaction: fakeTx,
    });
    expect(mockEntrySymptom.destroy).toHaveBeenCalledWith({
      where: { entryId: { [Op.in]: ["entry-1"] } },
      transaction: fakeTx,
    });
    expect(mockEntryMedication.destroy).toHaveBeenCalledWith({
      where: { entryId: { [Op.in]: ["entry-1"] } },
      transaction: fakeTx,
    });
    expect(mockEntryDoctorVisit.destroy).toHaveBeenCalledWith({
      where: { entryId: { [Op.in]: ["entry-1"] } },
      transaction: fakeTx,
    });
    expect(mockDailyEntry.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockUserCondition.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockUserSymptom.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockUserMedication.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockUserDoctor.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockUserClinic.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockRefreshToken.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockSession.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
    expect(mockUser.destroy).toHaveBeenCalledWith({
      where: { id: userId },
      transaction: fakeTx,
    });
  });

  it("skips entry cleanups when the user has no entries", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockDailyEntry.findAll.mockResolvedValue([]);

    await service.deleteAccount(userId, "SecurePass1");

    expect(mockEntryCondition.destroy).not.toHaveBeenCalled();
    expect(mockEntrySymptom.destroy).not.toHaveBeenCalled();
    expect(mockDailyEntry.destroy).toHaveBeenCalledWith({
      where: { userId },
      transaction: fakeTx,
    });
  });

  it("throws 500 for non-operational errors", async () => {
    mockUser.findByPk.mockResolvedValue(userRecord as never);
    mockVerifyPassword.mockResolvedValue(true);
    mockDailyEntry.findAll.mockRejectedValue(new Error("db blew up"));

    const error = await service
      .deleteAccount(userId, "SecurePass1")
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      message: "Failed to delete account",
      statusCode: 500,
    });
  });
});
