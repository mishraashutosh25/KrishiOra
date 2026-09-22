import { Navigate, useLocation } from "react-router-dom";
import authService from "../../services/auth.service";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute
 *
 * Wraps authenticated routes. If no valid token exists in localStorage,
 * redirects to /login with a `returnTo` state so the user can be sent
 * back to the originally requested page after signing in.
 *
 * Usage in AppRoutes:
 *   <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
 */
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return (
      <Navigate
        to="/login"
        state={{
          returnTo: location.pathname + location.search,
          message: "Please sign in to access this page.",
        }}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
