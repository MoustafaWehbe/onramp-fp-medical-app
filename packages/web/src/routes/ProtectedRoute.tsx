import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isOnboardingDone } from "../lib/auth/location-state";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (!isOnboardingDone(user.id) && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
