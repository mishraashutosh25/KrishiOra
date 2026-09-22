import { motion } from "framer-motion";
import { Sparkles, TrendingUp, ShieldCheck, Sprout, Star } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

interface AuthVisualPanelProps {
  imageSrc?: string;
  badge?: string;
  title?: string;
  description?: string;
}

export const AuthVisualPanel = ({
  imageSrc = "/hero-farm.jpg",
  badge,
  title,
  description,
}: AuthVisualPanelProps) => {
  const { lang } = useTranslation();

  const isHindi = lang === "hi";

  const defaultBadge = badge || (isHindi ? "🌾 आधुनिक कृषि ऑपरेटिंग सिस्टम" : "🌾 Smart Farm Operating System");
  const defaultTitle = title || (isHindi ? "अपनी खेती को स्मार्ट और मुनाफ़ेदार बनाएं।" : "Cultivate clarity. Maximize your agricultural yield.");
  const defaultDesc = description || (isHindi 
    ? "प्लॉट प्रबंधन, फसल चक्र और दैनिक कृषि व्यय को आसानी से ट्रैक करें। आधुनिक किसानों का विश्वसनीय साथी।"
    : "Track plot expenses, monitor crop lifecycles, and optimize seasonal profits with real-time agricultural intelligence.");

  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-slate-950 p-8 xl:p-12 text-white select-none">
      {/* 1. Full-Cover High-Definition Background Image */}
      <motion.img
        initial={{ scale: 1.08, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: "easeOut" }}
        src={imageSrc}
        alt="KrishiOra Agricultural Landscape"
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
      />

      {/* 2. Premium Balanced Scrim / Lighting Overlay (Keeps natural farm colors vibrant while maintaining text legibility) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/30 to-slate-950/90"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/30 via-transparent to-transparent"
      />

      {/* 3. Top Brand Identity & Badge */}
      <motion.div 
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="relative z-10 flex items-center justify-between"
      >
        <a
          href="/"
          className="group inline-flex items-center gap-3.5 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-transform hover:scale-[1.02]"
          aria-label="KrishiOra Home"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 p-2 shadow-lg backdrop-blur-md border border-white/25 group-hover:bg-white/25 transition-all">
            <img
              src="/krishiora-logo.png"
              alt="KrishiOra Logo"
              className="h-full w-full object-contain brightness-0 invert"
              width={28}
              height={28}
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xl font-extrabold tracking-tight text-white drop-shadow-md">
              KrishiOra
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-300 drop-shadow-sm">
              Smart Agriculture
            </span>
          </div>
        </a>

        {/* Live Badge */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/40 px-3 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur-md shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{defaultBadge}</span>
        </div>
      </motion.div>

      {/* 4. Center / Bottom Content with Glassmorphic Feature Highlights */}
      <div className="relative z-10 my-auto py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-xl"
        >
          {/* Tagline Pill */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-md">
            <Sparkles size={13} className="text-emerald-400" />
            <span>{isHindi ? "भारत के प्रगतिशील किसानों का मंच" : "Built for Progressive Indian Farmers"}</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight text-white drop-shadow-lg mb-3.5">
            {defaultTitle}
          </h2>

          <p className="text-sm xl:text-base leading-relaxed text-slate-200/90 font-normal drop-shadow-md max-w-lg mb-6">
            {defaultDesc}
          </p>

          {/* Glass Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/15 transition-all">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <TrendingUp size={15} />
                </div>
                <span className="text-xs font-bold text-white">
                  {isHindi ? "स्मार्ट व्यय ट्रैकिंग" : "Expense & Profit AI"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {isHindi ? "बीज से कटाई तक हर एकड़ की सही लागत और मुनाफ़ा देखें।" : "Live per-acre input cost analysis and net profit forecasting."}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:bg-white/15 transition-all">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  <Sprout size={15} />
                </div>
                <span className="text-xs font-bold text-white">
                  {isHindi ? "प्लॉट और फसल चक्र" : "Plot & Crop Cycle"}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                {isHindi ? "बुवाई, सिंचाई, खाद व कटाई का सटीक समय और योजना।" : "Dynamic lifecycle tracking from sowing to harvest storage."}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. Bottom Trust & Social Proof Bar */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4 text-xs"
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" stroke="none" />
            ))}
          </div>
          <span className="font-semibold text-slate-200">
            {isHindi ? "4.9/5 रेटिंग • 10,000+ एकड़ प्रबंधित" : "4.9/5 Rating • 10,000+ Acres Managed"}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-300 font-medium text-[11px]">
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <ShieldCheck size={14} />
            {isHindi ? "100% सुरक्षित डेटा" : "100% Secure & Private"}
          </span>
          <span className="text-white/30">•</span>
          <span>{isHindi ? "12+ भारतीय भाषाएं" : "12+ Indian Languages"}</span>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthVisualPanel;
