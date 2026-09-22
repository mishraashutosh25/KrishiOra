import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Mail, ArrowRight } from "lucide-react";
import AuthVisualPanel from "../components/auth/AuthVisualPanel";
import { useTranslation } from "../hooks/useTranslation";
import { translations } from "../i18n/translations";
import LanguageSwitcher from "../components/landing/navbar/LanguageSwitcher";
import authService from "../services/auth.service";

export const Login = () => {
  const navigate = useNavigate();

  // Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useTranslation();
  const authStr = t.auth?.login ?? translations.en.auth.login;

  // Status & Validation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    identifier?: string;
    password?: string;
    form?: string;
  }>({});

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    authService.loginWithGoogle();
  };

  const validateForm = () => {
    const newErrors: { identifier?: string; password?: string } = {};

    const trimmedId = identifier.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = trimmedId.replace(/\D/g, "");
    const isPhone = phoneDigits.length === 10 && /^[6-9]\d{9}$/.test(phoneDigits);

    if (!trimmedId) {
      newErrors.identifier = authStr.validation.emailRequired;
    } else if (!emailRegex.test(trimmedId) && !isPhone) {
      newErrors.identifier = authStr.validation.emailInvalid;
    }

    if (!password) {
      newErrors.password = authStr.validation.passwordRequired;
    } else if (password.length < 6) {
      newErrors.password = authStr.validation.passwordShort;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const isPhone = !identifier.includes("@");
      if (isPhone) {
        setErrors({
          identifier: authStr.validation.emailOnlyError || "Account sign-in currently requires your registered email address.",
        });
        return;
      }

      const response = await authService.login({
        email: identifier.trim(),
        password,
      });

      if (response.success) {
        navigate("/dashboard");
      } else {
        setErrors({ form: response.message || authStr.validation.loginFailed });
      }
    } catch (err: any) {
      setErrors({ form: err.message || authStr.validation.loginFailed });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFBF9] text-slate-900 grid lg:grid-cols-[1fr_1.15fr] xl:grid-cols-[1fr_1.2fr]">
      {/* 1. LEFT: Agricultural Visual Panel */}
      <AuthVisualPanel
        imageSrc="/hero-farm.jpg"
      />

      {/* 2. RIGHT: Authentication Panel — true center layout */}
      <main className="relative flex min-h-screen flex-col overflow-y-auto bg-[#FAFBF9]">
        {/* Top Bar: absolutely pinned to top */}
        <div className="flex items-center justify-end w-full px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 lg:hidden outline-none focus-visible:ring-2 focus-visible:ring-green-700 rounded-lg mr-auto"
            aria-label="KrishiOra Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 p-1 border border-green-200/80">
              <img
                src="/krishiora-logo.png"
                alt="KrishiOra Logo"
                className="h-full w-full object-contain"
                width={28}
                height={28}
              />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-950">
              KrishiOra
            </span>
          </Link>

          <LanguageSwitcher />

          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-900 hover:border-green-300 hover:bg-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          >
            <ArrowLeft
              size={13}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span>{authStr.backToHome}</span>
          </Link>
        </div>

        {/* Card: fills remaining space, true center */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
        <div className="w-full max-w-[440px]">
          <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-[0_10px_30px_-5px_rgba(13,56,35,0.06),0_2px_8px_-2px_rgba(0,0,0,0.04)]">
            
            {/* Header with Brand Badge */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200/90 bg-green-50/80 px-3 py-1 text-xs font-semibold text-green-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
                  <span>KrishiOra Farmer Portal</span>
                </div>
                
                <span className="text-[11px] font-medium text-slate-400">
                  v2.4
                </span>
              </div>

              <h1 className="text-[28px] font-extrabold tracking-tight text-slate-900 mb-1.5">
                {authStr.title}
              </h1>
              <p className="text-sm font-medium text-slate-600">
                {authStr.subtitle}
              </p>
            </div>

            {/* Form Alert */}
            {errors.form && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs font-medium text-red-800"
              >
                {errors.form}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4.5">
              {/* Field 1: Email or Mobile */}
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  {authStr.emailLabel}
                </label>

                <div className="relative flex items-center">
                  {!identifier && (
                    <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                      <Mail size={16} strokeWidth={1.8} />
                    </div>
                  )}

                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    required
                    aria-invalid={Boolean(errors.identifier)}
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errors.identifier) {
                        setErrors((prev) => ({ ...prev, identifier: undefined }));
                      }
                    }}
                    placeholder={authStr.emailPlaceholder}
                    className={`h-12 w-full rounded-xl border bg-white pr-4 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                      identifier ? "pl-3.5 font-medium" : "pl-10"
                    } ${
                      errors.identifier
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-300 hover:border-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                    }`}
                  />
                </div>

                {errors.identifier && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-600">
                    {errors.identifier}
                  </p>
                )}
              </div>

              {/* Field 2: Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700"
                  >
                    {authStr.passwordLabel}
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-green-700 hover:text-green-800 transition-colors"
                  >
                    {authStr.forgotPassword}
                  </Link>
                </div>

                <div className="relative flex items-center">
                  {!password && (
                    <div className="pointer-events-none absolute left-3.5 flex items-center justify-center text-slate-400">
                      <LockKeyhole size={16} strokeWidth={1.8} />
                    </div>
                  )}

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(errors.password)}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="••••••••"
                    className={`h-12 w-full rounded-xl border bg-white pr-10 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                      password ? "pl-3.5 tracking-wider font-medium" : "pl-10"
                    } ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        : "border-slate-300 hover:border-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-[11px] font-medium text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2.5 pt-0.5">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-green-700 accent-green-700 focus:ring-green-600 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs font-medium gap-2 text-slate-600 select-none cursor-pointer"
                >
                  {authStr.rememberMe}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-sm font-bold text-white shadow-[0_2px_10px_-2px_rgba(22,101,52,0.45)] transition-all hover:shadow-[0_4px_16px_-2px_rgba(22,101,52,0.55)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:opacity-60 active:scale-[0.99] cursor-pointer"
              >
                <span
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                {isSubmitting ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>{authStr.submitting}</span>
                  </>
                ) : (
                  <>
                    <span>{authStr.submitBtn}</span>
                    <ArrowRight size={14} className="opacity-80 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {authStr.orContinueWith || "or"}
                </span>
              </div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              disabled={isGoogleLoading || isSubmitting}
              onClick={handleGoogleLogin}
              className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 disabled:opacity-60 active:scale-[0.99] cursor-pointer"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Registration Link */}
            <div className="mt-6 text-center">
              <p className="text-xs font-medium text-slate-600">
                {authStr.newToPlatform}{" "}
                <Link
                  to="/register"
                  className="font-bold text-green-700 hover:text-green-800 hover:underline transition-colors"
                >
                  {authStr.createAccount}
                </Link>
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Login;