import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  Sprout,
  Tractor,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const stepIcons = [Tractor, Sprout, CircleDollarSign, BarChart3];

const HowItWorks = () => {
  const { t } = useTranslation();

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-slate-50/80 py-20 sm:py-24"
    >
      {/* Background Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-green-100/50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-8 sm:px-10 lg:px-16 xl:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-white px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-green-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-600" />
            {t.howItWorks.badge}
          </div>

          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            {t.howItWorks.headline1}
            <br />
            <span className="text-green-700">{t.howItWorks.headline2}</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            {t.howItWorks.subheadline}
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="relative mt-14">
          {/* Animated Connector Line on Desktop */}
          <div aria-hidden="true" className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[44px] hidden h-0.5 bg-slate-200/60 lg:block">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
              className="h-full w-full origin-left bg-gradient-to-r from-green-400 via-emerald-500 to-green-300"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.howItWorks.steps.map((step, index) => {
              const Icon = stepIcons[index] || Sprout;
              const stepNumber = `0${index + 1}`;

              return (
                <motion.article
                  key={stepNumber}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.15,
                  }}
                  className="group relative flex flex-col items-center"
                >
                  {/* Icon Circle */}
                  <div className="relative z-10 flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-50 bg-gradient-to-br from-green-600 to-emerald-700 text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(21,128,61,0.4)]">
                      <Icon size={26} strokeWidth={2} />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="mt-5 w-full flex-1 rounded-3xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:border-green-300 group-hover:shadow-xl group-hover:bg-gradient-to-b group-hover:from-green-50/30 group-hover:to-white">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-green-700">
                      {t.howItWorks.step} {stepNumber}
                    </span>

                    <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-900 group-hover:text-green-950 transition-colors">
                      {step.title}
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm leading-6 text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.15 }}
          className="mx-auto mt-12 max-w-3xl rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:p-7"
        >
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Sprout size={20} strokeWidth={1.8} />
            </div>

            <div className="flex-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                {t.howItWorks.bannerTitle}
              </h3>
              <p className="mt-0.5 text-xs sm:text-sm leading-6 text-slate-500">
                {t.howItWorks.bannerDesc}
              </p>
            </div>

            <a
              href="/register"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all duration-200 hover:bg-green-800"
            >
              {t.howItWorks.getStarted}
              <ArrowRight size={15} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
