import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

export const HeroContent = () => {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex max-w-[580px] flex-col justify-center pb-8 sm:pb-12 lg:pb-0"
    >
      {/* 1. Headline */}
      <motion.h1 
        variants={itemVariants}
        className="text-[3.5rem] leading-[1.1] font-extrabold tracking-tight text-slate-900 sm:text-[4rem] lg:text-[4.5rem]"
      >
        <span className="block">{t.hero.line1}</span>
        <span className="relative inline-flex items-center mt-2">
          {/* Yellow highlight behind text */}
          <span className="absolute bottom-1 left-0 -z-10 h-4 w-full bg-[#fde68a]" />
          <span className="text-[#166534]">{t.hero.line2}</span>
        </span>
        <span className="block mt-2">{t.hero.line3}</span>
      </motion.h1>

      {/* 2. Subheadline */}
      <motion.p 
        variants={itemVariants}
        className="mt-6 max-w-lg text-[1.125rem] leading-[1.6] text-slate-600 sm:text-[1.25rem]"
      >
        {t.hero.subheadline}
      </motion.p>

      {/* 3. CTA Buttons */}
      <motion.div 
        variants={itemVariants}
        className="mt-8 flex flex-wrap items-center gap-4"
      >
        <a
          href="/dashboard"
          className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-slate-950 px-8 text-[0.95rem] font-bold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(rgba(255,255,255,0.2),transparent_50%)]" />
          <span className="relative flex items-center gap-2">
            {t.hero.ctaPrimary}
            <ArrowRight size={16} strokeWidth={2.5} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </a>

        <a
          href="#demo"
          className="inline-flex h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-8 text-[0.95rem] font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          {t.hero.ctaSecondary}
        </a>
      </motion.div>
    </motion.div>
  );
};

export default HeroContent;
