import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { AuthProvider, useAuthContext } from "../../providers/AuthProvider";
import { ProvidersWrapper } from "../renderWithProviders";

const { mockGet, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("../../lib/api-client", () => ({
  apiClient: { get: mockGet, post: mockPost },
}));

const VALID_USER = {
  id: "user-1",
  email: "alice@example.com",
  name: "Alice",
  role: "user",
};

function wrapper({ children }: { children: ReactNode }) {
  return (
    <ProvidersWrapper>
      <AuthProvider>{children}</AuthProvider>
    </ProvidersWrapper>
  );
}

function renderAuth() {
  return renderHook(() => useAuthContext(), { wrapper });
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReset();
    mockPost.mockReset();
    mockGet.mockResolvedValue({ data: { data: null } });
  });

  // ─── session restore on mount ─────────────────────────────────────────────

  it("restores the user from /auth/me on mount", async () => {
    mockGet.mockResolvedValue({ data: { data: VALID_USER } });

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.user).toEqual(VALID_USER));
    expect(result.current.isLoading).toBe(false);
    expect(mockGet).toHaveBeenCalledWith("/auth/me");
  });

  // ─── invalid role from the API ────────────────────────────────────────────

  it("rejects login when the API returns an unsupported role", async () => {
    mockPost.mockResolvedValue({
      data: { data: { user: { ...VALID_USER, role: "superadmin" } } },
    });

    const { result } = renderAuth();

    await act(async () => {
      await expect(
        result.current.login("alice@example.com", "SecurePass1"),
      ).rejects.toThrow("Unsupported role: superadmin");
    });
  });

  it("leaves the user null when session restore returns an invalid role", async () => {
    mockGet.mockResolvedValue({
      data: { data: { ...VALID_USER, role: "superadmin" } },
    });

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  // ─── logout clears state even when the API call fails ─────────────────────

  it("clears the user when logout fails", async () => {
    mockGet.mockResolvedValue({ data: { data: VALID_USER } });

    const { result } = renderAuth();
    await waitFor(() => expect(result.current.user).toEqual(VALID_USER));

    mockPost.mockRejectedValue(new Error("logout network failure"));

    await act(async () => {
      await expect(result.current.logout()).rejects.toThrow(
        "logout network failure",
      );
    });
    await waitFor(() => expect(result.current.user).toBeNull());
  });
});
