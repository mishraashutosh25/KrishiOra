import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import authService from "../services/auth.service";

/**
 * AuthCallback — handles the Google OAuth redirect from backend.
 *
 * Backend redirects to /auth/callback?access_token=...&user_id=...&user_email=...
 * On error: /auth/callback?error=...&error_description=...
 *
 * This page:
 * 1. Reads the token from URL params
 * 2. Stores it in localStorage via authService.setSession()
 * 3. Redirects to /dashboard
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [errorMessage] = useState<string>(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    if (error) {
      return errorDescription || "Google sign-in failed. Please try again.";
    }

    const accessToken = searchParams.get("access_token");
    const userId = searchParams.get("user_id");
    if (!accessToken || !userId) {
      return "Authentication failed. Missing session data. Please try again.";
    }
    return "";
  });

  useEffect(() => {
    if (errorMessage) return;

    const accessToken = searchParams.get("access_token");
    const userId = searchParams.get("user_id");
    const userEmail = searchParams.get("user_email");
    const userName = searchParams.get("user_name");

    if (accessToken && userId) {
      // Store session exactly like email/password login
      authService.setSession(accessToken, {
        id: userId,
        email: userEmail || "",
        name: userName || "",
      });

      // Clean URL and redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [errorMessage, searchParams, navigate]);

  // Error state
  if (errorMessage) {
    return (
      <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-8 shadow-lg text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 mx-auto mb-5">
            <AlertCircle size={28} className="text-red-600" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-2">
            Sign-in Failed
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            {errorMessage}
          </p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-green-700 to-green-800 text-sm font-bold text-white hover:-translate-y-0.5 transition-all shadow-md"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  // Loading state (processing token)
  return (
    <div className="min-h-screen bg-[#FAFBF9] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 border border-green-200/80">
          <img
            src="/krishiora-logo.png"
            alt="KrishiOra"
            className="h-10 w-10 object-contain"
          />
        </div>
        <Loader2 size={24} className="animate-spin text-green-700" />
        <p className="text-sm font-medium text-slate-500">
          Completing sign-in...
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
