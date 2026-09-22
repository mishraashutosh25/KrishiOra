import { Sprout, Droplets, TrendingUp, Sparkles, Calendar, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * High-craft, industry-grade KrishiOra Field Intelligence Console Preview
 * Consolidates Crop Lifecycle, IoT Soil Data & Expense Intelligence into ONE believable product interface.
 */
export const FieldIntelligenceConsole = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.3 } }}
      className="w-full rounded-3xl border border-white/60 bg-white/85 p-4 sm:p-5 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-2xl ring-1 ring-white/50"
    >
      {/* Console Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-900 shadow-2xs">
            <Sprout size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-bold text-slate-950 leading-tight">
                Sharbati Wheat — Field 4A
              </p>
              <span className="rounded-md bg-green-50 px-1.5 py-0.5 text-[9px] font-bold text-green-800 border border-green-200/80">
                Rabi 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              8.5 Acres · Loamy Soil · Deep Borewell
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 border border-emerald-200/80 shadow-2xs">
          <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-800 tracking-wide">
            Optimal Growth
          </span>
        </div>
      </div>

      {/* Lifecycle Progress Row */}
      <div className="pt-3.5">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Calendar size={13} className="text-green-700" />
            Vegetative Growth Phase
          </span>
          <span className="font-bold text-green-900 bg-green-100/60 px-2 py-0.5 rounded-md">
            Day 44 / 120
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/70">
          <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-green-600 to-emerald-500 transition-all duration-700 shadow-2xs" />
        </div>

        <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-medium">
          <span>Sown: Nov 12</span>
          <span className="text-emerald-700 font-bold">Earhead Stage in ~14 days</span>
          <span>Harvest: Mar 20</span>
        </div>
      </div>

      {/* Season Expense & Resource Intelligence Grid */}
      <div className="mt-3.5 pt-3.5 border-t border-slate-100 grid grid-cols-2 gap-2.5">
        {/* Metric 1: Rabi Season Spend */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-3 border border-slate-100 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <span className="text-[10px] font-bold text-emerald-700 flex items-center">
              <TrendingUp size={11} className="mr-0.5" />
              On Budget
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-slate-950">
              ₹42,800
            </span>
            <span className="text-[11px] text-slate-400 font-medium">/ ₹65,000</span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
            <span>Fertilizer & Seeds</span>
            <span className="font-semibold text-slate-700">66%</span>
          </div>
        </motion.div>

        {/* Metric 2: Field Resource Status */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-3 border border-slate-100 shadow-sm transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Soil Moisture
            </span>
            <Droplets size={13} className="text-sky-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-slate-950">
              68%
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded">
              Adequate
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
            <span>Next Drip Cycle</span>
            <span className="font-semibold text-slate-700">In 2 Days</span>
          </div>
        </motion.div>
      </div>

      {/* Live AI Advisory Pill */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent px-3 py-2 border border-emerald-200/70">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-emerald-700 shrink-0" />
          <p className="text-[11px] font-medium text-slate-800 truncate">
            <span className="font-bold text-green-950">AI Insight:</span> Nitrogen boost recommended before flowering.
          </p>
        </div>
        <span className="text-[10px] font-bold text-emerald-800 flex items-center shrink-0 ml-2">
          Details <ArrowUpRight size={11} className="ml-0.5" />
        </span>
      </div>
    </motion.div>
  );
};

export const FarmLocationBadge = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
      className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-slate-950/60 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl backdrop-blur-xl"
    >
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-[13px] tracking-wide">Hoshiarpur Farm — Plot B</span>
        <span className="text-[10.5px] text-emerald-100/90 font-medium">28.5 Acres Total · GPS Synced</span>
      </div>
    </motion.div>
  );
};

export const LiveYieldForecastBadge = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -2 }}
      className="inline-flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-2.5 text-xs shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 text-green-800 shadow-inner">
        <TrendingUp size={16} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimated Yield</span>
        <span className="text-[13px] font-extrabold text-slate-900">+18.4% above avg</span>
      </div>
    </motion.div>
  );
};
