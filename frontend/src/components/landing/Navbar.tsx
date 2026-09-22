import { useState, useEffect } from "react";
import { Menu, ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import NavbarLinks from "./navbar/NavbarLinks";
import MobileNavDrawer from "./navbar/MobileNavDrawer";
import { useTranslation } from "../../hooks/useTranslation";

export const Navbar = () => {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Fixed position layer — pill floats above all page content */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-5 lg:px-6 pt-3 sm:pt-4 pointer-events-none">

        {/* ═══════════ THE FLOATING PILL ═══════════ */}
        <motion.header
          initial={false}
          animate={
            scrolled
              ? {
                  y: 0,
                  boxShadow:
                    "0 12px 48px -8px rgba(13,56,35,0.14), 0 4px 16px -4px rgba(0,0,0,0.08), inset 0 1px 0 0 rgba(255,255,255,0.7)",
                }
              : {
                  y: 0,
                  boxShadow:
                    "0 4px 20px -4px rgba(13,56,35,0.08), 0 1px 4px -1px rgba(0,0,0,0.04), inset 0 1px 0 0 rgba(255,255,255,0.9)",
                }
          }
          transition={{
            duration: shouldReduceMotion ? 0.05 : 0.35,
            ease: [0.22, 1, 0.36, 1],
          }}
          className={`
            pointer-events-auto w-full max-w-[1140px]
            rounded-[20px] border transition-all duration-300
            ${
              scrolled
                ? "bg-white/[0.94] border-slate-200/80 backdrop-blur-2xl backdrop-saturate-150"
                : "bg-white/85 border-white/60 backdrop-blur-xl backdrop-saturate-125"
            }
          `}
        >
          <div className="flex h-[58px] sm:h-[64px] items-center justify-between px-3 sm:px-4 lg:px-5">

            {/* ── LEFT: Brand Identity ── */}
            <a
              href="/"
              className="group flex shrink-0 items-center gap-2.5 rounded-2xl pr-1 outline-none focus-visible:ring-2 focus-visible:ring-green-700"
              aria-label="KrishiOra — return to home"
            >
              {/* Solid green logo mark */}
              <div className="relative flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-green-600 to-green-800 p-1.5 shadow-[0_2px_8px_-2px_rgba(22,101,52,0.45)] transition-all duration-200 group-hover:shadow-[0_4px_14px_-3px_rgba(22,101,52,0.5)] group-hover:scale-[1.06]">
                <img
                  src="/krishiora-logo.png"
                  alt="KrishiOra Logo"
                  className="h-full w-full object-contain brightness-0 invert"
                  width={24}
                  height={24}
                />
              </div>

              <div className="flex flex-col leading-[1.1]">
                <span className="text-[15.5px] font-extrabold tracking-[-0.04em] text-[#0D3823]">
                  KrishiOra
                </span>
                <span className="text-[8px] font-bold uppercase tracking-[0.24em] text-green-700/70">
                  Smart Agriculture
                </span>
              </div>
            </a>

            {/* ── CENTER: Desktop navigation ── */}
            <NavbarLinks />

            {/* ── RIGHT: Desktop CTAs ── */}
            <div className="hidden items-center gap-1.5 lg:flex">
              {/* Log in — subtle ghost */}
              <a
                href="/login"
                className="inline-flex h-[36px] items-center justify-center rounded-full px-4 text-[13px] font-semibold text-slate-700 transition-all duration-150 hover:bg-green-800/[0.07] hover:text-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700"
              >
                {t.nav.login}
              </a>

              {/* Thin divider */}
              <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-slate-200/80" />

              {/* Get Started — premium solid pill CTA */}
              <a
                href="/register"
                className="group relative inline-flex h-[36px] items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-green-700 to-green-800 px-5 text-[13px] font-bold text-white shadow-[0_2px_10px_-3px_rgba(22,101,52,0.5)] transition-all duration-200 hover:shadow-[0_4px_18px_-4px_rgba(22,101,52,0.55)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2 active:scale-[0.97]"
              >
                {/* Subtle inner shine */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
                <Sparkles size={13} className="opacity-80" aria-hidden="true" />
                <span>{t.nav.getStarted}</span>
                <ArrowRight
                  size={13}
                  aria-hidden="true"
                  className="opacity-80 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </div>

            {/* ── RIGHT: Mobile hamburger ── */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav-drawer"
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-green-800/[0.07] hover:text-green-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 lg:hidden"
            >
              <Menu size={19} />
            </button>
          </div>
        </motion.header>
      </div>

      {/* Spacer: prevents Hero from hiding behind the fixed floating pill */}
      <div aria-hidden="true" className="h-[74px] sm:h-[84px]" />

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  );
};

export default Navbar;
