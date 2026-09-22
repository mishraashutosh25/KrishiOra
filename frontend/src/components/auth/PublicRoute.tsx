import { Navigate } from "react-router-dom";
import authService from "../../services/auth.service";

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * PublicRoute
 *
 * Wraps auth pages (login, register, forgot-password, etc.).
 * If the user already has a valid token, they are redirected to /dashboard
 * instead of seeing the login/register forms again.
 *
 * This prevents the awkward state where a logged-in user manually
 * navigates to /login and sees the sign-in form.
 *
 * Usage in AppRoutes:
 *   <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
 */
const PublicRoute = ({ children }: PublicRouteProps) => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
