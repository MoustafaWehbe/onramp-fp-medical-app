import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { RoleRoute } from "../../routes/RoleRoute";
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

function renderRoleRoute(roles: AuthUser["role"][]) {
  return renderWithProviders(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route element={<RoleRoute roles={roles} />}>
          <Route path="/protected" element={<div>PROTECTED</div>} />
        </Route>
        <Route path="*" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RoleRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
    useAuthMock.mockReturnValue({ user: null, isLoading: false });
  });

  // ─── wrong role redirects to home path for the actual role ────────────────

  it("redirects a user hitting an admin route to /dashboard", () => {
    useAuthMock.mockReturnValue({ user: user("user"), isLoading: false });
    renderRoleRoute(["admin"]);

    expect(screen.getByTestId("location")).toHaveTextContent("/dashboard");
    expect(screen.queryByText("PROTECTED")).not.toBeInTheDocument();
  });

  it("redirects an admin hitting a user route to /admin", () => {
    useAuthMock.mockReturnValue({ user: user("admin"), isLoading: false });
    renderRoleRoute(["user"]);

    expect(screen.getByTestId("location")).toHaveTextContent("/admin");
    expect(screen.queryByText("PROTECTED")).not.toBeInTheDocument();
  });

  // ─── matching role renders the protected outlet ───────────────────────────

  it("renders the outlet when the user has the required role", () => {
    useAuthMock.mockReturnValue({ user: user("admin"), isLoading: false });
    renderRoleRoute(["admin"]);

    expect(screen.getByText("PROTECTED")).toBeInTheDocument();
  });

  // ─── unauthenticated user is sent to login ────────────────────────────────

  it("redirects an unauthenticated user to /login", () => {
    useAuthMock.mockReturnValue({ user: null, isLoading: false });
    renderRoleRoute(["admin"]);

    expect(screen.getByTestId("location")).toHaveTextContent("/login");
    expect(screen.queryByText("PROTECTED")).not.toBeInTheDocument();
  });
});
