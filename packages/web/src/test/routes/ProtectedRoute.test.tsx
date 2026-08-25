import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "../../routes/ProtectedRoute";
import { ONBOARDING_DONE_KEY } from "../../lib/auth/location-state";
import { renderWithProviders } from "../renderWithProviders";
import type { AuthUser } from "../../providers/AuthProvider";

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock("../../hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

function user(role: AuthUser["role"]): AuthUser {
  return { id: "user-1", email: "a@b.com", name: "Alice", role };
}

function renderProtectedRoute() {
  return renderWithProviders(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>PROTECTED</div>} />
        </Route>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({ user: null, isLoading: false });
    window.localStorage.clear();
  });

  // ─── loading state shows a spinner ────────────────────────────────────────

  it("shows the loading spinner while the session is being restored", () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: true });
    renderProtectedRoute();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("PROTECTED")).not.toBeInTheDocument();
  });

  // ─── onboarding gate (regular users) ─────────────────────────────────────

  it("redirects a regular user to /onboarding when onboarding is incomplete", () => {
    useAuthMock.mockReturnValue({ user: user("user"), isLoading: false });
    renderProtectedRoute();

    expect(screen.getByTestId("location")).toHaveTextContent("/onboarding");
    expect(screen.queryByText("PROTECTED")).not.toBeInTheDocument();
  });

  it("renders the protected outlet once the regular user completes onboarding", () => {
    window.localStorage.setItem(`${ONBOARDING_DONE_KEY}_user-1`, "1");
    useAuthMock.mockReturnValue({ user: user("user"), isLoading: false });
    renderProtectedRoute();

    expect(screen.getByText("PROTECTED")).toBeInTheDocument();
  });

  // ─── unauthenticated user is redirected to login ──────────────────────────

  it("redirects an unauthenticated user to /login", () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false });
    renderProtectedRoute();

    expect(screen.getByTestId("location")).toHaveTextContent("/login");
    expect(screen.queryByText("PROTECTED")).not.toBeInTheDocument();
  });

  // ─── admin skips onboarding redirect ─────────────────────────────────────

  it("allows an admin to access protected routes without completing onboarding", () => {
    useAuthMock.mockReturnValue({ user: user("admin"), isLoading: false });
    renderProtectedRoute();

    expect(screen.getByText("PROTECTED")).toBeInTheDocument();
  });
});
