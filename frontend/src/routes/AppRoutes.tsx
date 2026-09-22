import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "../contexts/LanguageContext";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import AuthCallback from "../pages/AuthCallback";
import ForgotPassword from "../pages/ForgotPassword";
import Dashboard from "../pages/Dashboard";
import Farms from "../pages/Farms";
import FarmDetails from "../pages/FarmDetails";
import Crops from "../pages/Crops";
import Expenses from "../pages/Expenses";
import ExpenseDetails from "../pages/ExpenseDetails";
import Analytics from "../pages/Analytics";
import Profile from "../pages/Profile";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";

import About from "../pages/About";
import Privacy from "../pages/Privacy";
import Terms from "../pages/Terms";

const AppRoutes = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
      <Routes>
        {/* Landing & Public Pages */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Public Auth Routes — redirect to /dashboard if already logged in */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Protected Application Routes — require authentication */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Farm Routes */}
          <Route path="/farms" element={<Farms />} />
          <Route path="/farms/:farmId" element={<FarmDetails />} />

          {/* Crop Routes */}
          <Route path="/crops" element={<Crops />} />

          {/* Expense Routes */}
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/:expenseId" element={<ExpenseDetails />} />

          {/* Analytics Route */}
          <Route path="/analytics" element={<Analytics />} />

          {/* Farmer Profile & Settings Route */}
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </LanguageProvider>
  );
};

export default AppRoutes;