import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import AuthVisualPanel from "../components/auth/AuthVisualPanel";
import LanguageSwitcher from "../components/landing/navbar/LanguageSwitcher";
import { translations } from "../i18n/translations";
import { useTranslation } from "../hooks/useTranslation";
import authService from "../services/auth.service";

/* ─── Constants ─────────────────────────────────────────── */
const indianStates = [
  "Punjab", "Haryana", "Maharashtra", "Madhya Pradesh",
  "Uttar Pradesh", "Gujarat", "Rajasthan", "Karnataka",
  "Andhra Pradesh", "Telangana", "Tamil Nadu", "West Bengal",
  "Bihar", "Odisha", "Other State / UT",
];

/* ─── Password Strength ─────────────────────────────────── */
const strengthMeta = (pw: string) => {
  if (!pw) return null;
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 1) return { label: "Weak",   bar: "bg-red-400",   text: "text-red-500",   w: "w-1/4" };
  if (score === 2) return { label: "Fair",   bar: "bg-amber-400", text: "text-amber-600", w: "w-2/4" };
  if (score === 3) return { label: "Good",   bar: "bg-blue-500",  text: "text-blue-600",  w: "w-3/4" };
  return               { label: "Strong", bar: "bg-green-600", text: "text-green-700", w: "w-full" };
};

/* ─── Section Label ─────────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">{children}</span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

/* ─── Text Input ────────────────────────────────────────── */
const TextInput = ({
  id, name, type = "text", autoComplete, required, value, onChange,
  placeholder, hasIcon, hasError, rightSlot,
}: {
  id: string; name: string; type?: string; autoComplete?: string;
  required?: boolean; value: string; onChange: (v: string) => void;
  placeholder: string; hasIcon: boolean; hasError: boolean;
  rightSlot?: React.ReactNode;
}) => (
  <input
    id={id}
    name={name}
    type={type}
    autoComplete={autoComplete}
    required={required}
    aria-invalid={hasError}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`h-11 w-full rounded-xl border bg-white text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all
      ${hasIcon && !value ? "pl-10" : "pl-3.5"}
      ${value && type !== "password" ? "font-medium" : ""}
      ${value && type === "password" ? "pl-3.5 tracking-widest font-medium" : ""}
      ${rightSlot ? "pr-10" : "pr-3.5"}
      ${hasError
        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-slate-200 hover:border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/10"
      }`}
  />
);

/* ─── Main Component ────────────────────────────────────── */
export const Register = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const authStr = t.auth?.register ?? translations.en.auth.register;

  const [name, setName]                     = useState("");
  const [email, setEmail]                   = useState("");
  const [phone, setPhone]                   = useState("");
  const [state, setState]                   = useState("");
  const [password, setPassword]             = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms]         = useState(false);
  const [showPw, setShowPw]                 = useState(false);
  const [showCPw, setShowCPw]               = useState(false);
  const [isSubmitting, setIsSubmitting]     = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string; email?: string; phone?: string; state?: string;
    password?: string; confirmPassword?: string;
    agreeTerms?: string; form?: string;
  }>({});

  const clearErr = (k: keyof typeof errors) => setErrors((p) => ({ ...p, [k]: undefined }));

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    authService.loginWithGoogle();
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim())                   e.name = authStr.validation.nameRequired;
    else if (name.trim().length < 2)    e.name = authStr.validation.nameRequired;
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim())                  e.email = authStr.validation.emailRequired;
    else if (!emailRx.test(email))      e.email = authStr.validation.emailInvalid;
    const d = phone.replace(/\D/g, "");
    if (!d)                             e.phone = authStr.validation.phoneRequired;
    else if (!/^[6-9]\d{9}$/.test(d))  e.phone = authStr.validation.phoneInvalid;
    if (!state)                         e.state = authStr.validation.stateRequired;
    if (!password)                      e.password = authStr.validation.passwordRequired;
    else if (password.length < 6)       e.password = authStr.validation.passwordShort;
    if (!confirmPassword)               e.confirmPassword = authStr.validation.confirmRequired;
    else if (confirmPassword !== password) e.confirmPassword = authStr.validation.confirmMismatch;
    if (!agreeTerms)                    e.agreeTerms = authStr.validation.termsRequired;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const response = await authService.signup({
        email: email.trim(),
        password,
        full_name: name.trim(),
        phone: phone.trim(),
        state: state.trim(),
      });

      if (response.success) {
        navigate("/verify-email", {
          state: {
            email: email.trim(),
            phone: phone.trim(),
            state: state.trim(),
          },
        });
      } else {
        setErrors({ form: response.message || authStr.validation.registerFailed });
      }
    } catch (err: any) {
      setErrors({ form: err.message || authStr.validation.registerFailed });
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength       = strengthMeta(password);
  const passwordsMatch = !!confirmPassword && confirmPassword === password;

  return (
    <div className="min-h-screen w-full bg-[#FAFBF9] text-slate-900 grid lg:grid-cols-[1fr_1.15fr] xl:grid-cols-[1fr_1.2fr]">
      {/* LEFT */}
      <AuthVisualPanel
        imageSrc="/footer-farm.jpg"
      />

      {/* RIGHT */}
      <main className="relative flex min-h-screen flex-col overflow-y-auto bg-[#FAFBF9]">
        {/* Top Bar */}
        <div className="flex items-center justify-end w-full px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 gap-4">
          <LanguageSwitcher />
          <Link
            to="/"
            className="flex items-center gap-2.5 lg:hidden outline-none focus-visible:ring-2 focus-visible:ring-green-700 rounded-lg mr-auto"
            aria-label="KrishiOra Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 p-1 border border-green-200/80">
              <img src="/krishiora-logo.png" alt="KrishiOra Logo" className="h-full w-full object-contain" width={28} height={28} />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-950">KrishiOra</span>
          </Link>
          <Link
            to="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-900 hover:border-green-300 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          >
            <ArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>{authStr.backToHome}</span>
          </Link>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center px-5 sm:px-8 py-8">
          <div className="w-full max-w-[500px]">
            <div className="w-full rounded-3xl border border-slate-200/90 bg-white shadow-[0_12px_40px_-8px_rgba(13,56,35,0.07),0_2px_8px_-2px_rgba(0,0,0,0.04)]">
              
              {/* Card Header */}
              <div className="px-7 pt-8 sm:px-10 sm:pt-10 pb-6 border-b border-slate-100">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200/90 bg-green-50/80 px-3 py-1 text-xs font-semibold text-green-900 mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
                  <span>KrishiOra</span>
                </div>
                <h1 className="text-[1.6rem] sm:text-[1.85rem] font-extrabold tracking-[-0.03em] text-slate-950 leading-tight">
                  {authStr.title}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-[320px]">
                  {authStr.subtitle}
                </p>
              </div>

              {/* Card Body */}
              <div className="px-7 py-7 sm:px-10 sm:py-8">

                {/* Form error */}
                {errors.form && (
                  <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-xs font-medium text-red-800">
                    {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-6">

                  {/* ── Section: Personal Info ── */}
                  <div>
                    <SectionLabel>{authStr.title || "Personal information"}</SectionLabel>
                    <div className="space-y-3.5">

                      {/* Full Name */}
                      <div>
                        <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5">{authStr.nameLabel}</label>
                        <div className="relative">
                          {!name && (
                            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                              <UserIcon size={15} strokeWidth={1.8} />
                            </div>
                          )}
                          <TextInput
                            id="name" name="name" autoComplete="name" required
                            value={name} onChange={(v) => { setName(v); clearErr("name"); }}
                            placeholder={authStr.namePlaceholder}
                            hasIcon={true} hasError={Boolean(errors.name)}
                          />
                        </div>
                        {errors.name && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.name}</p>}
                      </div>

                      {/* Email + Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">{authStr.emailLabel}</label>
                          <div className="relative">
                            {!email && (
                              <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                                <Mail size={15} strokeWidth={1.8} />
                              </div>
                            )}
                            <TextInput
                              id="email" name="email" type="email" autoComplete="email" required
                              value={email} onChange={(v) => { setEmail(v); clearErr("email"); }}
                              placeholder={authStr.emailPlaceholder}
                              hasIcon={true} hasError={Boolean(errors.email)}
                            />
                          </div>
                          {errors.email && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5">{authStr.phoneLabel}</label>
                          <div className="relative">
                            {!phone && (
                              <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                                <Phone size={15} strokeWidth={1.8} />
                              </div>
                            )}
                            <TextInput
                              id="phone" name="phone" type="tel" autoComplete="tel" required
                              value={phone} onChange={(v) => { setPhone(v); clearErr("phone"); }}
                              placeholder={authStr.phonePlaceholder}
                              hasIcon={true} hasError={Boolean(errors.phone)}
                            />
                          </div>
                          {errors.phone && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.phone}</p>}
                        </div>
                      </div>

                      {/* State */}
                      <div>
                        <label htmlFor="state" className="block text-xs font-semibold text-slate-700 mb-1.5">{authStr.stateLabel}</label>
                        <div className="relative">
                          {!state && (
                            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                              <MapPin size={15} strokeWidth={1.8} />
                            </div>
                          )}
                          <select
                            id="state" name="state" value={state}
                            onChange={(e) => { setState(e.target.value); clearErr("state"); }}
                            aria-invalid={Boolean(errors.state)}
                            className={`h-11 w-full appearance-none rounded-xl border bg-white pr-9 text-sm outline-none transition-all hover:border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/10 cursor-pointer
                              ${state ? "pl-3.5 text-slate-900 font-medium" : "pl-10 text-slate-400"}
                              ${errors.state
                                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-slate-200 hover:border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/10"
                              }`}
                          >
                            <option value="" disabled>{authStr.statePlaceholder}</option>
                            {indianStates.map((st) => <option key={st} value={st}>{st}</option>)}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-400">
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                        {errors.state && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.state}</p>}
                      </div>
                    </div>
                  </div>

                  {/* ── Section: Security ── */}
                  <div>
                    <SectionLabel>{authStr.passwordLabel || "Security"}</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {/* Password */}
                      <div>
                        <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">{authStr.passwordLabel}</label>
                        <div className="relative">
                          {!password && (
                            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                              <LockKeyhole size={15} strokeWidth={1.8} />
                            </div>
                          )}
                          <input
                            id="password" name="password"
                            type={showPw ? "text" : "password"}
                            autoComplete="new-password" required
                            aria-invalid={Boolean(errors.password)}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); clearErr("password"); }}
                            placeholder={authStr.passwordPlaceholder}
                            className={`h-11 w-full rounded-xl border bg-white pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all
                              ${password ? "pl-3.5 tracking-wider font-medium" : "pl-10"}
                              ${errors.password
                                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : "border-slate-200 hover:border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/10"
                              }`}
                          />
                          <button type="button" onClick={() => setShowPw((p) => !p)} aria-label="Toggle password"
                            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                            {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {/* Strength bar */}
                        {password && strength && (
                          <div className="mt-2 space-y-1">
                            <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-500 ${strength.bar} ${strength.w}`} />
                            </div>
                            <p className={`text-[11px] font-semibold ${strength.text}`}>{strength.label}</p>
                          </div>
                        )}
                        {errors.password && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.password}</p>}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-slate-700 mb-1.5">{authStr.confirmPasswordLabel}</label>
                        <div className="relative">
                          {!confirmPassword && (
                            <div className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
                              <LockKeyhole size={15} strokeWidth={1.8} />
                            </div>
                          )}
                          <input
                            id="confirmPassword" name="confirmPassword"
                            type={showCPw ? "text" : "password"}
                            autoComplete="new-password" required
                            aria-invalid={Boolean(errors.confirmPassword)}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); clearErr("confirmPassword"); }}
                            placeholder={authStr.confirmPasswordPlaceholder}
                            className={`h-11 w-full rounded-xl border bg-white pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all
                              ${confirmPassword ? "pl-3.5 tracking-wider font-medium" : "pl-10"}
                              ${errors.confirmPassword
                                ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                                : passwordsMatch
                                ? "border-green-500 focus:border-green-700 focus:ring-2 focus:ring-green-700/10"
                                : "border-slate-200 hover:border-slate-300 focus:border-green-700 focus:ring-2 focus:ring-green-700/10"
                              }`}
                          />
                          <button type="button" onClick={() => setShowCPw((p) => !p)} aria-label="Toggle confirm password"
                            className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                            {showCPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        {passwordsMatch && !errors.confirmPassword && (
                          <p className="mt-1.5 flex items-center gap-1 text-[11px] font-semibold text-green-700">
                            <CheckCircle2 size={11} /> Passwords match
                          </p>
                        )}
                        {errors.confirmPassword && <p className="mt-1.5 text-[11px] font-medium text-red-600">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>

                  {/* ── Terms ── */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3.5">
                    <div className="flex items-start gap-3">
                      <input
                        id="terms" name="terms" type="checkbox" required
                        checked={agreeTerms}
                        onChange={(e) => { setAgreeTerms(e.target.checked); clearErr("agreeTerms"); }}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 accent-green-700 cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
                        {authStr.agreeTerms}
                      </label>
                    </div>
                    {errors.agreeTerms && (
                      <p className="mt-2 text-[11px] font-medium text-red-600">{errors.agreeTerms}</p>
                    )}
                  </div>

                  {/* ── CTA ── */}
                  <button
                    type="submit" disabled={isSubmitting}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-sm font-bold text-white shadow-[0_2px_12px_-2px_rgba(22,101,52,0.45)] transition-all hover:shadow-[0_4px_20px_-2px_rgba(22,101,52,0.55)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:opacity-60 active:scale-[0.99] cursor-pointer"
                  >
                    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    {isSubmitting ? (
                      <><Loader2 size={16} className="animate-spin" /><span>{authStr.submitting}</span></>
                    ) : (
                      <><Sparkles size={14} className="opacity-80" /><span>{authStr.submitBtn}</span><ArrowRight size={14} className="opacity-80 transition-transform duration-200 group-hover:translate-x-0.5" /></>
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative mt-7">
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
              </div>

              {/* Card Footer */}
              <div className="px-7 py-5 sm:px-10 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  {authStr.alreadyHaveAccount}{" "}
                  <Link to="/login" className="font-bold text-green-800 hover:text-green-950 transition-colors">
                    {authStr.loginInstead}
                  </Link>
                </p>
              </div>
            </div>

            {/* Security badge */}
            <div className="flex items-center justify-center gap-2 mt-5 text-xs text-slate-400">
              <ShieldCheck size={13} className="text-green-700" />
              <span>256-Bit Encrypted · KrishiOra Privacy Guaranteed</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;