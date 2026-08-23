import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInstance, mockPost, handlers } = vi.hoisted(() => ({
  mockInstance: vi.fn(),
  mockPost: vi.fn(),
  handlers: {
    fulfilled: null as null | ((config: unknown) => unknown),
    rejected: null as null | ((error: unknown) => Promise<unknown>),
  },
}));

vi.mock("axios", () => ({
  default: {
    create: () => {
      const instance = mockInstance as typeof mockInstance & {
        interceptors: {
          request: {
            use: (onFulfilled: (config: unknown) => unknown) => void;
          };
          response: {
            use: (
              onFulfilled: unknown,
              onRejected: (error: unknown) => Promise<unknown>,
            ) => void;
          };
        };
      };
      instance.interceptors = {
        request: {
          use: (onFulfilled) => {
            handlers.fulfilled = onFulfilled;
          },
        },
        response: {
          use: (_onFulfilled, onRejected) => {
            handlers.rejected = onRejected;
          },
        },
      };
      return instance;
    },
    post: mockPost,
  },
}));

vi.mock("../../i18n", () => ({
  default: { language: "en" },
}));

import { apiClient } from "../../lib/api-client";

function unauthorizedError(config: Record<string, unknown>) {
  return { response: { status: 401 }, config };
}

describe("apiClient 401 interceptor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInstance.mockReset();
    mockPost.mockReset();
  });

  it("attaches X-App-Language from i18n on requests", () => {
    const headers = { set: vi.fn() };
    const config = { headers };
    const result = handlers.fulfilled?.(config);
    expect(result).toBe(config);
    expect(headers.set).toHaveBeenCalledWith("X-App-Language", "en");
  });

  // ─── single 401 -> refresh -> retry -> success ────────────────────────────

  it("refreshes the token and retries the original request once", async () => {
    mockPost.mockResolvedValue({ data: { message: "Token refreshed" } });
    mockInstance.mockResolvedValueOnce({ data: { ok: true } });

    const originalConfig = { url: "/entries", method: "get" };
    const promise = (handlers.rejected as (error: unknown) => Promise<unknown>)(
      unauthorizedError(originalConfig),
    );

    await expect(promise).resolves.toEqual({ data: { ok: true } });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith("/api/auth/refresh", null, {
      withCredentials: true,
    });
    expect(apiClient).toHaveBeenCalledWith(originalConfig);
    expect((originalConfig as { _retry?: boolean })._retry).toBe(true);
  });

  // ─── refresh fails -> original 401 propagates ─────────────────────────────

  it("rejects with the original 401 when the refresh call fails", async () => {
    mockPost.mockRejectedValue(new Error("refresh network failure"));

    const originalConfig = { url: "/entries", method: "get" };
    const error = unauthorizedError(originalConfig);
    const promise = (handlers.rejected as (error: unknown) => Promise<unknown>)(
      error,
    );

    await expect(promise).rejects.toBe(error);
    expect(apiClient).not.toHaveBeenCalled();
  });

  // ─── non-401 errors are not retried ───────────────────────────────────────

  it("rejects immediately without refreshing for non-401 errors", async () => {
    const error = { response: { status: 403 }, config: { url: "/entries" } };
    const promise = (handlers.rejected as (error: unknown) => Promise<unknown>)(
      error,
    );

    await expect(promise).rejects.toBe(error);
    expect(mockPost).not.toHaveBeenCalled();
    expect(apiClient).not.toHaveBeenCalled();
  });
});
