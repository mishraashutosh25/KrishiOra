import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Mail,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import AuthVisualPanel from "../components/auth/AuthVisualPanel";
import LanguageSwitcher from "../components/landing/navbar/LanguageSwitcher";
import authService from "../services/auth.service";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as {
    email?: string;
    phone?: string;
    state?: string;
  } | null;

  const email = locationState?.email || "";
  const phone = locationState?.phone || "";
  const farmState = locationState?.state || "";

  // Redirect to register if no email in state
  useEffect(() => {
    if (!email) {
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  // OTP digits array
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // UI state
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Focus first empty input or last on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const getOtpString = () => digits.join("");

  const focusInput = (index: number) => {
    inputRefs.current[Math.max(0, Math.min(index, OTP_LENGTH - 1))]?.focus();
  };

  const handleDigitChange = useCallback(
    (index: number, value: string) => {
      const cleaned = value.replace(/\D/g, "").slice(-1);
      const next = [...digits];
      next[index] = cleaned;
      setDigits(next);
      setError("");

      if (cleaned && index < OTP_LENGTH - 1) {
        focusInput(index + 1);
      }
    },
    [digits]
  );

  const handleKeyDown = useCallback(
    (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace") {
        if (digits[index]) {
          const next = [...digits];
          next[index] = "";
          setDigits(next);
        } else if (index > 0) {
          focusInput(index - 1);
          const next = [...digits];
          next[index - 1] = "";
          setDigits(next);
        }
        e.preventDefault();
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1);
        e.preventDefault();
      } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
        focusInput(index + 1);
        e.preventDefault();
      }
    },
    [digits]
  );

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    setError("");
    // Focus on the next empty slot or last
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    focusInput(focusIdx);
  }, []);

  const handleVerify = async () => {
    if (isVerifying) return;
    const otp = getOtpString();

    if (otp.length < OTP_LENGTH) {
      setError("Please enter all 6 digits of the OTP.");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const profileData =
        phone || farmState ? { phone, state: farmState } : undefined;

      const res = await authService.verifyEmail(
        { email, token: otp },
        profileData
      );

      if (res.success) {
        setSuccessMessage(
          "Email verified successfully! You can now sign in to your account."
        );
        // Navigate to login after a short delay so user sees the success message
        setTimeout(() => {
          navigate("/login", {
            state: {
              email,
              message: "Email verified! Please sign in to continue.",
            },
          });
        }, 2000);
      } else {
        setError(
          res.message || "OTP verification failed. Please try again."
        );
        // Clear digits on failure so user can re-enter
        setDigits(Array(OTP_LENGTH).fill(""));
        focusInput(0);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Verification failed. Please try again.";
      setError(message);
      setDigits(Array(OTP_LENGTH).fill(""));
      focusInput(0);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    setError("");

    try {
      const res = await authService.resendOtp({ email });
      if (res.success) {
        setResendCooldown(RESEND_COOLDOWN_SECONDS);
        setDigits(Array(OTP_LENGTH).fill(""));
        focusInput(0);
      } else {
        setError(res.message || "Failed to resend OTP. Please try again.");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to resend OTP. Please try again.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const filledCount = digits.filter(Boolean).length;
  const isComplete = filledCount === OTP_LENGTH;

  return (
    <div className="min-h-screen w-full bg-[#FAFBF9] text-slate-900 grid lg:grid-cols-[1fr_1.15fr] xl:grid-cols-[1fr_1.2fr]">
      {/* LEFT: Agricultural Visual Panel */}
      <AuthVisualPanel
        imageSrc="/footer-farm.jpg"
      />

      {/* RIGHT: Verification Panel */}
      <main className="relative flex min-h-screen flex-col overflow-y-auto bg-[#FAFBF9]">
        {/* Top Bar Navigation */}
        <div className="flex items-center justify-end w-full px-6 sm:px-10 lg:px-14 pt-6 sm:pt-8 gap-4">
          {/* Mobile Logo */}
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

          {/* Back to Register */}
          <Link
            to="/register"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-green-900 hover:border-green-300 hover:bg-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
          >
            <ArrowLeft
              size={13}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            <span>Back</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-10 py-8 sm:py-12">
          <div className="w-full max-w-[480px]">
            <div className="w-full rounded-[28px] border border-slate-200/90 bg-white p-6 sm:p-9 md:p-10 shadow-[0_20px_45px_-15px_rgba(15,23,42,0.06),0_2px_8px_-2px_rgba(0,0,0,0.03)] ring-1 ring-slate-900/[0.02]">

              {/* Card Header */}
              <div className="mb-7 sm:mb-8">
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-green-200/90 bg-green-50/80 px-3 py-1 text-xs font-semibold text-green-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" aria-hidden="true" />
                    <span>Email Verification</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Step 2 of 2
                  </span>
                </div>

                <h1 className="text-2xl sm:text-[1.85rem] font-extrabold tracking-[-0.03em] text-slate-950 leading-tight">
                  Check your inbox
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  We've sent a 6-digit verification code to{" "}
                  <span className="font-semibold text-slate-700 break-all">
                    {email}
                  </span>
                  . Enter it below to verify your account.
                </p>
              </div>

              {/* Success Banner */}
              {successMessage && (
                <div
                  role="status"
                  className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4 flex items-start gap-3"
                >
                  <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs font-medium text-red-800"
                >
                  {error}
                </div>
              )}

              {/* OTP Input Grid */}
              {!successMessage && (
                <div className="space-y-6">
                  {/* 6-Box OTP Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-3">
                      Verification Code
                    </label>
                    <div
                      className="flex gap-2.5 sm:gap-3"
                      role="group"
                      aria-label="6-digit verification code"
                    >
                      {digits.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { inputRefs.current[i] = el; }}
                          id={`otp-${i}`}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          autoComplete={i === 0 ? "one-time-code" : "off"}
                          aria-label={`Digit ${i + 1} of ${OTP_LENGTH}`}
                          disabled={isVerifying || !!successMessage}
                          onChange={(e) => handleDigitChange(i, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(i, e)}
                          onPaste={i === 0 ? handlePaste : undefined}
                          onFocus={(e) => e.target.select()}
                          className={`
                            w-full aspect-square max-w-[54px] rounded-xl border text-center text-xl font-bold
                            text-slate-900 outline-none transition-all duration-150
                            ${digit
                              ? "border-green-600 bg-green-50/60 text-green-900"
                              : "border-slate-200 bg-slate-50/30 hover:border-slate-300"
                            }
                            ${error
                              ? "border-red-300 bg-red-50/20 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                              : "focus:border-green-700 focus:bg-white focus:ring-4 focus:ring-green-700/10"
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        />
                      ))}
                    </div>
                    {/* Progress indicator */}
                    <p className="mt-2 text-[11px] text-slate-400">
                      {filledCount < OTP_LENGTH
                        ? `${filledCount} of ${OTP_LENGTH} digits entered`
                        : "Ready to verify"}
                    </p>
                  </div>

                  {/* Verify Button */}
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={!isComplete || isVerifying}
                    className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-green-700 via-green-800 to-green-900 text-sm font-bold text-white shadow-[0_4px_14px_-2px_rgba(22,101,52,0.45)] transition-all hover:shadow-[0_6px_20px_-2px_rgba(22,101,52,0.55)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[0_4px_14px_-2px_rgba(22,101,52,0.45)] active:scale-[0.99] cursor-pointer"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                    {isVerifying ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Mail size={15} className="opacity-80" aria-hidden="true" />
                        <span>Verify Email Address</span>
                      </>
                    )}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center border-t border-slate-100 pt-5">
                    <p className="text-xs text-slate-500 mb-2">
                      Didn't receive the code?
                    </p>
                    {resendCooldown > 0 ? (
                      <p className="text-xs font-medium text-slate-400">
                        Resend available in{" "}
                        <span className="font-bold text-green-700 tabular-nums">
                          {resendCooldown}s
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending || isVerifying}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 hover:text-green-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 rounded"
                      >
                        {isResending ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw size={13} />
                            <span>Resend verification code</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Already verified / sign in link */}
              {successMessage && (
                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    state={{ email, message: "Email verified! Please sign in to continue." }}
                    className="inline-flex items-center gap-2 text-sm font-bold text-green-800 hover:text-green-950 transition-colors"
                  >
                    <span>Proceed to Sign In</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom Trust Row */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-center text-[11px] font-medium text-slate-400 mt-6">
              <div className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-green-700" />
                <span>Secure Verification</span>
              </div>
              <div className="inline-flex items-center gap-1.5">
                <Mail size={13} className="text-green-700" />
                <span>Check spam folder if not received</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;
