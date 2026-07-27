import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  homePathForRole,
  type AppRole,
} from "../lib/auth/roles";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";

interface RoleRouteProps {
  roles: AppRole[];
}

export function RoleRoute({ roles }: RoleRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(user.role as AppRole)) {
    return <Navigate to={homePathForRole(user.role)} replace />;
  }

  return <Outlet />;
}
