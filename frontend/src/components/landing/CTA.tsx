import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Leaf,
  Sprout,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const CTA = () => {
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24">
      {/* Background Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-8 sm:px-10 lg:px-16 xl:px-20">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[32px] bg-green-950 px-6 py-12 shadow-2xl shadow-green-950/15 sm:px-10 sm:py-14 lg:px-14 lg:py-16"
        >
          {/* Decorative Rings */}
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-green-800/50" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-green-800/30" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-20 h-72 w-72 rounded-full border border-green-800/40" />

          <div className="relative grid gap-10 lg:grid-cols-[1fr_340px] lg:items-center">
            {/* Content Column */}
            <div>
              {/* Eyebrow */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-green-700/60 bg-green-900/50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                <Sprout size={14} />
                {t.cta.eyebrow}
              </div>

              {/* Heading */}
              <h2 className="max-w-3xl text-3xl font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
                {t.cta.headline1}
                <span className="text-green-400"> {t.cta.headline2}</span>
              </h2>

              {/* Description */}
              <p className="mt-4 max-w-2xl text-sm sm:text-base leading-7 text-green-100/70">
                {t.cta.subheadline}
              </p>

              {/* Actions */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="/register"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-green-950 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-green-50"
                >
                  {t.cta.ctaPrimary}
                  <ArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </a>

                <a
                  href="#features"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-green-700/70 bg-green-900/30 px-6 text-sm font-semibold text-green-100 transition-all duration-200 hover:border-green-600 hover:bg-green-900/60"
                >
                  {t.cta.ctaSecondary}
                </a>
              </div>
            </div>

            {/* Benefits Checklist Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-400/10 text-green-300">
                  <Leaf size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    {t.cta.cardTitle}
                  </p>
                  <p className="mt-0.5 text-[10px] text-green-100/50">
                    {t.cta.cardSub}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {t.cta.benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.35,
                      delay: 0.2 + index * 0.08,
                    }}
                    className="flex gap-2.5"
                  >
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-green-400/15 text-green-300">
                      <Check size={11} strokeWidth={2.5} />
                    </div>
                    <p className="text-xs leading-5 text-green-100/80">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4">
                <TrendingUp size={15} className="text-green-400" />
                <p className="text-[11px] text-green-100/60">
                  {t.cta.cardFooter}
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
