import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Leaf,
  MapPinned,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const featureIcons = [Sprout, Leaf, CircleDollarSign, BarChart3];

const Features = () => {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      className="relative overflow-hidden bg-white py-20 sm:py-24"
    >
      {/* Background decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute right-[-180px] top-20 h-[420px] w-[420px] rounded-full bg-green-50/70 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-8 sm:px-10 lg:px-16 xl:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="max-w-3xl"
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-600" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-700">
              {t.features.badge}
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            {t.features.headline1}
            <br />
            <span className="text-green-700">{t.features.headline2}</span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {t.features.subheadline}
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {t.features.items.map((feature, index) => {
            const Icon = featureIcons[index] || Sprout;
            const number = `0${index + 1}`;

            return (
              <motion.article
                key={number}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group relative overflow-hidden rounded-[24px] border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:border-green-300 hover:shadow-[0_20px_40px_-15px_rgba(22,163,74,0.15)] sm:p-7"
              >
                {/* Subtle Hover Gradient Glow */}
                <div className="absolute -inset-0.5 bg-gradient-to-br from-green-400 to-emerald-600 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-10" />

                {/* Number */}
                <div className="absolute right-6 top-6 text-xs font-bold tracking-[0.18em] text-slate-300">
                  {number}
                </div>

                {/* Icon */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700 transition-all duration-300 group-hover:bg-green-700 group-hover:text-white">
                  <Icon size={20} strokeWidth={1.8} />
                </div>

                {/* Content */}
                <div className="mt-6 max-w-md">
                  <h3 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>

                {/* Points */}
                <div className="mt-6 space-y-2.5">
                  {feature.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700"
                    >
                      <CheckCircle2
                        size={15}
                        className="shrink-0 text-green-600"
                        strokeWidth={2.2}
                      />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                {/* Bottom Interactive Visual Preview */}
                <div className="relative mt-7 h-32 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/50 transition-colors duration-300 group-hover:bg-slate-50 group-hover:border-green-100">
                  {index === 0 && <FarmPreview />}
                  {index === 1 && <CropPreview />}
                  {index === 2 && <ExpensePreview />}
                  {index === 3 && <AnalyticsPreview />}
                </div>

                {/* Arrow Button */}
                <div className="absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                  <ArrowUpRight size={15} />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Bottom Statement */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-col justify-between gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-5 sm:flex-row sm:items-center sm:p-6"
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-green-700 shadow-sm">
              <TrendingUp size={19} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {t.features.connected}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {t.features.connectedSub}
              </p>
            </div>
          </div>

          <a
            href="#how-it-works"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-green-700 transition-colors hover:text-green-800"
          >
            {t.features.seeHow}
            <ArrowUpRight size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

/* =========================================================
   FARM PREVIEW
========================================================= */

const FarmPreview = () => {
  return (
    <div className="relative h-full p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            My Farms
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-800">
            3 Active Farms
          </p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-700">
          <MapPinned size={14} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {["Farm A", "Farm B", "Farm C"].map((farm, index) => (
          <motion.div
            key={farm}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm transition-transform hover:scale-105"
          >
            <div className="h-1.5 w-6 rounded-full bg-green-200" />
            <p className="mt-1.5 text-[9px] font-bold text-slate-700">
              {farm}
            </p>
            <p className="mt-0.5 text-[8px] text-slate-400 font-medium">
              {index === 0 ? "12 acres" : index === 1 ? "8 acres" : "15 acres"}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   CROP PREVIEW
========================================================= */

const CropPreview = () => {
  return (
    <div className="h-full p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Scientific Lifecycle Planner
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-800">
            ICAR Deterministic Engine
          </p>
        </div>
        <div className="flex items-center gap-1">
          <span className="rounded-sm bg-green-100 px-1.5 py-0.5 text-[8px] font-bold text-green-800">
            0d Drift
          </span>
          <Sprout size={15} className="text-green-600" />
        </div>
      </div>

      <div className="mt-2 grid grid-cols-4 gap-1">
        {[
          { name: "Sowing", done: true },
          { name: "Crown Root", done: true },
          { name: "Tillering", done: false, active: true },
          { name: "Harvest", done: false },
        ].map((stg) => (
          <div
            key={stg.name}
            className={`rounded-md p-1 text-center border text-[8px] font-semibold ${
              stg.done
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : stg.active
                ? "bg-blue-50 border-blue-200 text-blue-800 font-bold"
                : "bg-slate-50 border-slate-200/60 text-slate-400"
            }`}
          >
            <span className="truncate block">{stg.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* =========================================================
   EXPENSE PREVIEW
========================================================= */

const ExpensePreview = () => {
  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Total Expenses
          </p>
          <p className="mt-0.5 text-base font-bold text-slate-900">
            ₹48,200
          </p>
        </div>
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-100 text-green-700 shadow-inner">
          <CircleDollarSign size={15} strokeWidth={2.5} />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: "68%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500" 
          />
        </div>
        <span className="text-[9px] font-bold text-green-700">
          68%
        </span>
      </div>

      <div className="mt-2 flex justify-between text-[8px] font-medium text-slate-400">
        <span>Seeds & Inputs</span>
        <span>Labour</span>
        <span>Equipment</span>
      </div>
    </div>
  );
};

/* =========================================================
   ANALYTICS PREVIEW
========================================================= */

const AnalyticsPreview = () => {
  return (
    <div className="h-full p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Farm Performance
          </p>
          <p className="mt-0.5 text-xs font-bold text-slate-800">
            Growing steadily
          </p>
        </div>
        <BarChart3 size={17} className="text-green-600" />
      </div>

      <div className="relative mt-2 h-12">
        <svg
          viewBox="0 0 300 60"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d="M0 48 C25 43, 35 46, 55 38 S90 45, 110 31 S145 36, 165 25 S200 29, 220 19 S260 24, 300 7"
            fill="none"
            stroke="url(#gradient-line)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <motion.path
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            d="M0 48 C25 43, 35 46, 55 38 S90 45, 110 31 S145 36, 165 25 S200 29, 220 19 S260 24, 300 7 L300 60 L0 60 Z"
            fill="url(#gradient-fill)"
          />
          <defs>
            <linearGradient id="gradient-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="gradient-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#34D399" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default Features;
