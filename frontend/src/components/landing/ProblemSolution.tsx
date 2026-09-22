import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Leaf,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const ProblemSolution = () => {
  const { t } = useTranslation();

  const problemIcons = [ClipboardList, CircleDollarSign, BarChart3];
  const solutionIcons = [Sprout, TrendingUp, BarChart3];

  return (
    <section
      id="problem-solution"
      className="relative overflow-hidden bg-slate-50/70 py-20 sm:py-24"
    >
      {/* Background decoration */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-green-100/40 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-emerald-100/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-8 sm:px-10 lg:px-16 xl:px-20">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-green-700 shadow-sm">
            <Leaf size={14} />
            {t.problemSolution.badge}
          </div>

          <h2 className="text-3xl font-bold tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
            {t.problemSolution.headline1}
            <br />
            <span className="text-green-700">{t.problemSolution.headline2}</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {t.problemSolution.subheadline}
          </p>
        </motion.div>

        {/* Problem → Solution Cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          {/* Problems Card */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                {t.problemSolution.challengeLabel}
              </span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {t.problemSolution.challengeTitle}
              </h3>
            </div>

            <div className="space-y-5">
              {t.problemSolution.problems.map((problem, index) => {
                const Icon = problemIcons[index] || ClipboardList;
                return (
                  <motion.div
                    key={problem.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {problem.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {problem.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Center Connector Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="hidden lg:flex lg:flex-col lg:items-center lg:gap-2"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-green-200 bg-green-50 text-green-700 shadow-sm">
              <ArrowRight size={20} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700">
              KrishiOra
            </span>
          </motion.div>

          {/* Solutions Card */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            className="group relative rounded-3xl bg-green-950 p-6 shadow-2xl sm:p-8"
          >
            {/* Animated Glow Border */}
            <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-green-400 via-emerald-600 to-green-900 opacity-30 blur-sm transition-opacity duration-500 group-hover:opacity-60" />
            
            {/* Inner Card Background */}
            <div className="absolute inset-0 rounded-3xl bg-green-950 border border-white/10" />

            <div className="relative mb-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-300 drop-shadow-sm">
                {t.problemSolution.solutionLabel}
              </span>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-white drop-shadow-md">
                {t.problemSolution.solutionTitle}
              </h3>
            </div>

            <div className="relative space-y-5">
              {t.problemSolution.solutions.map((solution, index) => {
                const Icon = solutionIcons[index] || Sprout;
                return (
                  <motion.div
                    key={solution.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: index * 0.08 }}
                    className="flex gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-green-300 ring-1 ring-white/10">
                      <Icon size={19} strokeWidth={1.8} />
                    </div>

                    <div>
                      <h4 className="font-semibold text-white">
                        {solution.title}
                      </h4>
                      <p className="mt-1 text-sm leading-6 text-green-100/70">
                        {solution.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom Note */}
            <div className="mt-7 flex items-center gap-3 border-t border-white/10 pt-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/15">
                <Sprout size={16} className="text-green-300" />
              </div>
              <p className="text-xs font-medium text-green-100/70">
                {t.problemSolution.connected}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-3 text-center"
        >
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs sm:text-sm font-medium text-slate-500">
            {t.problemSolution.tagline}
          </span>
          <span className="h-px flex-1 bg-slate-200" />
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolution;
