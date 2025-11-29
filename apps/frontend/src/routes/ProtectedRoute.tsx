import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user) {
    const hasPermission = user.roles.some((role) =>
      allowedRoles.includes(role)
    );
    if (!hasPermission) {
      // Redirect to appropriate dashboard based on role or home
      if (user.roles.includes("ADMIN")) return <Navigate to="/admin" replace />;
      if (user.roles.includes("PLAYER")) return <Navigate to="/" replace />;
      if (user.roles.includes("OWNER")) return <Navigate to="/owner" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
