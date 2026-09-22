import { useState, useRef, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";
import AuthVisualPanel from "../components/auth/AuthVisualPanel";
import LanguageSwitcher from "../components/landing/navbar/LanguageSwitcher";
import authService from "../services/auth.service";

type Step = "REQUEST" | "VERIFY_OTP" | "RESET_PASSWORD" | "SUCCESS";

const STEPS: Step[] = ["REQUEST", "VERIFY_OTP", "RESET_PASSWORD", "SUCCESS"];
const STEP_LABELS = ["Email", "OTP", "Password", "Done"];

/* ─── OTP Box Component ─────────────────────────────────── */
const OtpInput = ({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (val: string) => void;
  hasError: boolean;
}) => {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (idx: number, char: string) => {
    if (!/^\d?$/.test(char)) return;
    const next = digits.map((d, i) => (i === idx ? char : d)).join("");
    onChange(next.slice(0, 6));
    if (char && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!digits[idx] && idx > 0) {
        const next = digits.map((d, i) => (i === idx - 1 ? "" : d)).join("");
        onChange(next);
        inputsRef.current[idx - 1]?.focus();
      } else {
        const next = digits.map((d, i) => (i === idx ? "" : d)).join("");
        onChange(next);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => { inputsRef.current[idx] = el; }}
          id={idx === 0 ? "otp-0" : undefined}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoFocus={idx === 0}
          autoComplete="one-time-code"
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`h-12 w-11 rounded-xl border bg-white text-center text-lg font-bold text-slate-900 outline-none transition-all
            ${digit ? "border-green-600 bg-green-50/30 text-green-800" : ""}
            ${hasError
              ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100"
              : "border-slate-300 hover:border-slate-400 focus:border-green-700 focus:ring-2 focus:ring-green-700/15"
            }`}
        />
      ))}
    </div>
  );
};

/* ─── Step Progress Bar ──────────────────────────────────── */
const StepBar = ({ current }: { current: Step }) => {
  const currentIdx = STEPS.indexOf(current);

  const visibleSteps = STEPS.filter(
    (step) => step !== "SUCCESS"
  );

  return (
    <div className="mb-8 w-full">
      <div className="flex w-full items-start">
        {visibleSteps.map((step, idx) => {
          const stepIdx = STEPS.indexOf(step);

          const isDone = currentIdx > stepIdx;
          const isActive = currentIdx === stepIdx;
          const isLast = idx === visibleSteps.length - 1;

          return (
            <div
              key={step}
              className="flex flex-1 items-start"
            >
              {/* Step */}
              <div className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className={`
                    flex h-8 w-8 items-center justify-center
                    rounded-full text-[11px] font-bold
                    transition-all duration-300

                    ${
                      isDone
                        ? "bg-green-700 text-white shadow-sm"
                        : isActive
                        ? "bg-green-700 text-white ring-4 ring-green-700/15 shadow-sm"
                        : "bg-slate-100 text-slate-400"
                    }
                  `}
                >
                  {isDone ? (
                    <CheckCircle2
                      size={14}
                      strokeWidth={2.5}
                    />
                  ) : (
                    idx + 1
                  )}
                </div>

                <span
                  className={`
                    mt-2 text-[11px] font-semibold
                    tracking-wide transition-colors duration-300

                    ${
                      isActive
                        ? "text-green-800"
                        : isDone
                        ? "text-slate-600"
                        : "text-slate-400"
                    }
                  `}
                >
                  {STEP_LABELS[idx]}
                </span>
              </div>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`
                    mt-4 h-px flex-1
                    transition-all duration-500

                    ${
                      currentIdx > stepIdx
                        ? "bg-green-600"
                        : "bg-slate-200"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Password Strength ──────────────────────────────────── */
const strengthLabel = (pw: string) => {
  if (!pw) return null;
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
  if (score === 2) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
  if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
  return { label: "Strong", color: "bg-green-600", width: "w-full" };
};

/* ─── Main Component ─────────────────────────────────────── */
export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("REQUEST");

  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errors, setErrors] = useState<{
    identifier?: string;
    otp?: string;
    password?: string;
    confirmPassword?: string;
    form?: string;
  }>({});

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  /* ── 1. Request OTP ── */
  const handleRequestSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});
    const trimmedId = identifier.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = trimmedId.replace(/\D/g, "");
    const isPhone = phoneDigits.length === 10 && /^[6-9]\d{9}$/.test(phoneDigits);
    if (!trimmedId) {
      setErrors({ identifier: "Please enter your email or 10-digit mobile number." });
      return;
    } else if (!emailRegex.test(trimmedId) && !isPhone) {
      setErrors({ identifier: "Please enter a valid email address or 10-digit mobile number." });
      return;
    }
    // Backend only supports email for password reset
    if (!emailRegex.test(trimmedId)) {
      setErrors({ identifier: "Password reset currently requires your registered email address." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword({ email: trimmedId });
      if (res.success) {
        setOtp("");
        setResendCooldown(60);
        setStep("VERIFY_OTP");
      } else {
        setErrors({ form: res.message || "Unable to process request. Please try again later." });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to process request. Please try again later.";
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── 2. Verify OTP ── */
  const handleVerifySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});
    if (otp.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit code." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authService.verifyResetOtp({ email: identifier.trim(), otp });
      if (res.success) {
        setStep("RESET_PASSWORD");
      } else {
        setErrors({ form: res.message || "Invalid OTP. Please check and try again." });
        setOtp("");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid OTP. Please check and try again.";
      setErrors({ form: message });
      setOtp("");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Resend Reset OTP ── */
  const handleResendOtp = async () => {
    if (isSubmitting || resendCooldown > 0) return;
    setErrors({});
    setIsSubmitting(true);
    try {
      const res = await authService.resendResetOtp({ email: identifier.trim() });
      if (res.success) {
        setOtp("");
        setResendCooldown(60);
      } else {
        setErrors({ form: res.message || "Failed to resend OTP. Please try again." });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend OTP. Please try again.";
      // If backend says cooldown remaining, parse seconds from message if possible
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── 3. Reset Password ── */
  const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrors({});
    const newErrors: { password?: string; confirmPassword?: string } = {};
    if (!password) newErrors.password = "Please enter a new password.";
    else if (password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword({ email: identifier.trim(), newPassword: password });
      if (res.success) {
        setStep("SUCCESS");
      } else {
        setErrors({ form: res.message || "Unable to reset password. Please try again later." });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to reset password. Please try again later.";
      setErrors({ form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const strength = strengthLabel(password);

  return (
    <div className="min-h-screen w-full bg-[#FAFBF9] text-slate-900 grid lg:grid-cols-[1fr_1.15fr] xl:grid-cols-[1fr_1.2fr]">
      {/* ── LEFT: AUTH VISUAL ── */}
<AuthVisualPanel
  imageSrc="/forget-farm.png"
/>

      {/* RIGHT */}
      <main className="relative flex min-h-screen flex-col overflow-y-auto bg-[#FAFBF9]">
        {/* Top Bar */}
        <div className="flex items-center justify-end w-full px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 gap-4">
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

          <LanguageSwitcher />

          <button
            onClick={() => {
              if (step === "VERIFY_OTP") setStep("REQUEST");
              else if (step === "RESET_PASSWORD") setStep("VERIFY_OTP");
              else navigate("/login");
            }}
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-900 hover:border-green-300 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 cursor-pointer"
          >
            <ArrowLeft size={13} className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span>{step === "VERIFY_OTP" || step === "RESET_PASSWORD" ? "Back" : "Back to login"}</span>
          </button>
        </div>

        {/* Card */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
          <div className="w-full max-w-[460px]">
            <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 shadow-[0_10px_30px_-5px_rgba(13,56,35,0.06),0_2px_8px_-2px_rgba(0,0,0,0.04)]">

              {/* Step Progress (only for non-success steps) */}
              {step !== "SUCCESS" && <StepBar current={step} />}

              {/* Header */}
              <div className="mb-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-200/90 bg-green-50/80 px-3 py-1 text-xs font-semibold text-green-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden="true" />
                    <span>Password Recovery</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-[1.85rem] font-extrabold tracking-[-0.03em] text-slate-950">
                  {step === "REQUEST" && "Forgot password?"}
                  {step === "VERIFY_OTP" && "Check your inbox"}
                  {step === "RESET_PASSWORD" && "Create new password"}
                  {step === "SUCCESS" && "You're all set!"}
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {step === "REQUEST" && "Enter your email or phone number and we'll send you a one-time code."}
                  {step === "VERIFY_OTP" && (
                    <>
                      We sent a 6-digit code to{" "}
                      <span className="font-semibold text-slate-800">{identifier}</span>.
                    </>
                  )}
                  {step === "RESET_PASSWORD" && "Choose a strong, unique password for your account."}
                  {step === "SUCCESS" && "Your password has been successfully updated."}
                </p>
              </div>

              {/* Form-level error */}
              {errors.form && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-xs font-medium text-red-800">
                  {errors.form}
                </div>
              )}

              {/* ── STEP 1: REQUEST ── */}
              {step === "REQUEST" && (
                <form
                  onSubmit={handleRequestSubmit}
                  noValidate
                  className="space-y-6"
                >
                  {/* Identifier */}
                  <div>
                    <label
                      htmlFor="identifier"
                      className="mb-2 block text-xs font-semibold tracking-wide text-slate-700"
                    >
                      Email or Mobile Number
                    </label>

                    <div className="group relative flex items-center">
                      {!identifier && (
                        <div className="pointer-events-none absolute left-4 z-10 text-slate-400 transition-colors group-focus-within:text-green-700">
                          <Mail
                            size={17}
                            strokeWidth={1.8}
                          />
                        </div>
                      )}

                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        required
                        autoComplete="username"
                        aria-invalid={Boolean(errors.identifier)}
                        value={identifier}
                        onChange={(e) => {
                          setIdentifier(e.target.value);
                          setErrors((p) => ({
                            ...p,
                            identifier: undefined,
                          }));
                        }}
                        placeholder="Enter your email or mobile number"
                        className={`h-13 w-full rounded-xl border bg-white pr-4 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 ${identifier
                            ? "pl-4 font-medium"
                            : "pl-11"
                          } ${errors.identifier
                            ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 hover:border-slate-300 focus:border-green-700 focus:ring-4 focus:ring-green-700/10"
                          }`}
                      />
                    </div>

                    {errors.identifier && (
                      <p className="mt-1.5 text-[11px] font-medium text-red-600">
                        {errors.identifier}
                      </p>
                    )}
                  </div>

                  {/* Send Verification Code */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
        group relative flex h-13 w-full
        items-center justify-center gap-2
        overflow-hidden rounded-xl
        bg-gradient-to-r from-green-700 via-green-800 to-green-900
        text-sm font-semibold tracking-tight text-white
        shadow-[0_8px_22px_-8px_rgba(22,101,52,0.55)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_12px_28px_-8px_rgba(22,101,52,0.65)]
        active:translate-y-0
        active:scale-[0.99]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-green-700
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
                  >
                    {/* Top highlight */}
                    <span
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent via-white/40 to-transparent
        "
                    />

                    {/* Hover shine */}
                    <span
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-0
          bg-gradient-to-r
          from-transparent via-white/[0.08] to-transparent
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
                    />

                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={17}
                          strokeWidth={2}
                          className="relative animate-spin"
                        />

                        <span className="relative">
                          Sending verification code...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative">
                          Send verification code
                        </span>

                        <ArrowRight
                          size={17}
                          strokeWidth={2}
                          className="
              relative opacity-80
              transition-transform duration-300
              group-hover:translate-x-1
            "
                        />
                      </>
                    )}
                  </button>

                  {/* Sign In */}
                  <p className="text-center text-xs text-slate-500">
                    Remembered your password?{" "}
                    <Link
                      to="/login"
                      className="
          font-semibold text-green-700
          transition-colors duration-200
          hover:text-green-900
          focus:outline-none
          focus-visible:underline
        "
                    >
                      Sign in instead
                    </Link>
                  </p>
                </form>
              )}

              {/* ── STEP 2: VERIFY OTP ── */}
              {step === "VERIFY_OTP" && (
                <form
                  onSubmit={handleVerifySubmit}
                  noValidate
                  className="space-y-6"
                >
                  {/* OTP Section */}
                  <div>
                    <label className="mb-4 block text-center text-xs font-semibold tracking-wide text-slate-700">
                      Enter the 6-digit verification code
                    </label>

                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      hasError={Boolean(errors.otp)}
                    />

                    {errors.otp && (
                      <p className="mt-2.5 text-center text-[11px] font-medium text-red-600">
                        {errors.otp}
                      </p>
                    )}
                  </div>

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || otp.length < 6}
                    className="
        group relative flex h-13 w-full
        items-center justify-center gap-2
        overflow-hidden rounded-xl
        bg-gradient-to-r from-green-700 via-green-800 to-green-900
        text-sm font-semibold tracking-tight text-white
        shadow-[0_8px_22px_-8px_rgba(22,101,52,0.55)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_12px_28px_-8px_rgba(22,101,52,0.65)]
        active:translate-y-0
        active:scale-[0.99]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-green-700
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-50
        disabled:hover:translate-y-0
      "
                  >
                    {/* Top highlight */}
                    <span
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent via-white/40 to-transparent
        "
                    />

                    {/* Hover shine */}
                    <span
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-0
          bg-gradient-to-r
          from-transparent via-white/[0.08] to-transparent
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
                    />

                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={17}
                          strokeWidth={2}
                          className="relative animate-spin"
                        />

                        <span className="relative">
                          Verifying code...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative">
                          Verify & Continue
                        </span>

                        <ArrowRight
                          size={17}
                          strokeWidth={2}
                          className="
              relative opacity-80
              transition-transform duration-300
              group-hover:translate-x-1
            "
                        />
                      </>
                    )}
                  </button>

                  {/* Resend Section */}
                  <div className="flex items-center justify-center gap-1.5 text-xs">
                    <span className="text-slate-500">
                      Didn't receive the code?
                    </span>

                    {resendCooldown > 0 ? (
                      <span className="font-medium text-slate-400">
                        Resend in <span className="font-bold text-green-700 tabular-nums">{resendCooldown}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleResendOtp}
                        className="font-semibold text-green-700 transition-colors duration-200 hover:text-green-900 focus:outline-none focus-visible:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Sending..." : "Resend code"}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {/* ── STEP 3: RESET PASSWORD ── */}
              {step === "RESET_PASSWORD" && (
                <form
                  onSubmit={handleResetSubmit}
                  noValidate
                  className="space-y-5"
                >
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-xs font-semibold tracking-wide text-slate-700"
                    >
                      New Password
                    </label>

                    <div className="group relative flex items-center">
                      {!password && (
                        <div className="pointer-events-none absolute left-4 z-10 text-slate-400 transition-colors group-focus-within:text-green-700">
                          <LockKeyhole size={17} strokeWidth={1.8} />
                        </div>
                      )}

                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoFocus
                        aria-invalid={Boolean(errors.password)}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setErrors((p) => ({
                            ...p,
                            password: undefined,
                          }));
                        }}
                        placeholder="Enter your new password"
                        className={`h-13 w-full rounded-xl border bg-white pr-11 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 ${password
                          ? "pl-4 tracking-wide font-medium"
                          : "pl-11"
                          } ${errors.password
                            ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-slate-200 hover:border-slate-300 focus:border-green-700 focus:ring-4 focus:ring-green-700/10"
                          }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff size={17} strokeWidth={1.8} />
                        ) : (
                          <Eye size={17} strokeWidth={1.8} />
                        )}
                      </button>
                    </div>

                    {/* Password Strength */}
                    {password && strength && (
                      <div className="mt-2.5 space-y-1.5">
                        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <p
                            className={`text-[11px] font-semibold ${strength.color.replace(
                              "bg-",
                              "text-"
                            )}`}
                          >
                            {strength.label} password
                          </p>

                          <span className="text-[10px] text-slate-400">
                            Password strength
                          </span>
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="mt-1.5 text-[11px] font-medium text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-xs font-semibold tracking-wide text-slate-700"
                    >
                      Confirm New Password
                    </label>

                    <div className="group relative flex items-center">
                      {!confirmPassword && (
                        <div className="pointer-events-none absolute left-4 z-10 text-slate-400 transition-colors group-focus-within:text-green-700">
                          <LockKeyhole size={17} strokeWidth={1.8} />
                        </div>
                      )}

                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        aria-invalid={Boolean(errors.confirmPassword)}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setErrors((p) => ({
                            ...p,
                            confirmPassword: undefined,
                          }));
                        }}
                        placeholder="Re-enter your new password"
                        className={`h-13 w-full rounded-xl border bg-white pr-11 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 ${confirmPassword
                          ? "pl-4 tracking-wide font-medium"
                          : "pl-11"
                          } ${errors.confirmPassword
                            ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                            : confirmPassword &&
                              confirmPassword === password
                              ? "border-green-400 focus:border-green-700 focus:ring-4 focus:ring-green-700/10"
                              : "border-slate-200 hover:border-slate-300 focus:border-green-700 focus:ring-4 focus:ring-green-700/10"
                          }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((p) => !p)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Hide password"
                            : "Show password"
                        }
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition-colors hover:text-slate-700 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={17} strokeWidth={1.8} />
                        ) : (
                          <Eye size={17} strokeWidth={1.8} />
                        )}
                      </button>
                    </div>

                    {/* Password Match */}
                    {confirmPassword &&
                      confirmPassword === password &&
                      !errors.confirmPassword && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-green-700">
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle2
                              size={10}
                              strokeWidth={2.5}
                            />
                          </span>

                          Passwords match
                        </div>
                      )}

                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-[11px] font-medium text-red-600">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="
        group relative mt-2 flex h-13 w-full
        items-center justify-center gap-2
        overflow-hidden rounded-xl
        bg-gradient-to-r from-green-700 via-green-800 to-green-900
        text-sm font-semibold tracking-tight text-white
        shadow-[0_8px_22px_-8px_rgba(22,101,52,0.55)]
        transition-all duration-300
        hover:-translate-y-0.5
        hover:shadow-[0_12px_28px_-8px_rgba(22,101,52,0.65)]
        active:translate-y-0
        active:scale-[0.99]
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-green-700
        focus-visible:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
                  >
                    {/* Top shine */}
                    <span
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-x-0 top-0 h-px
          bg-gradient-to-r
          from-transparent via-white/40 to-transparent
        "
                    />

                    {/* Hover shine */}
                    <span
                      aria-hidden="true"
                      className="
          pointer-events-none absolute inset-0
          bg-gradient-to-r
          from-transparent via-white/[0.08] to-transparent
          opacity-0 transition-opacity duration-300
          group-hover:opacity-100
        "
                    />

                    {isSubmitting ? (
                      <>
                        <Loader2
                          size={17}
                          strokeWidth={2}
                          className="relative animate-spin"
                        />
                        <span className="relative">
                          Saving password...
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="relative">
                          Save new password
                        </span>

                        <CheckCircle2
                          size={16}
                          strokeWidth={2}
                          className="
              relative opacity-80
              transition-transform duration-300
              group-hover:scale-110
            "
                        />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── STEP 4: SUCCESS ── */}
              {step === "SUCCESS" && (
                <div className="space-y-6">
                  {/* Animated success block */}
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 ring-8 ring-green-100/60">
                      <CheckCircle2 size={32} strokeWidth={1.8} />
                    </div>
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-900 mb-1">
                      Password updated!
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-[260px]">
                      You can now sign in to KrishiOra with your new password.
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="group relative mt-7 flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-[15px] font-semibold tracking-tight text-white shadow-[0_8px_24px_-8px_rgba(22,101,52,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-8px_rgba(22,101,52,0.65)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
                  >
                    {/* Top highlight */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    />

                    {/* Hover shine */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    <span className="relative">
                      Go to login
                    </span>

                    <ArrowRight
                      size={17}
                      strokeWidth={2}
                      className="relative opacity-80 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
