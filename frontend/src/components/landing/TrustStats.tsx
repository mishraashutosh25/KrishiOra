import { motion } from "framer-motion";
import {
  Grid2X2,
  Languages,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const TrustStats = () => {
  const { t } = useTranslation();

  const stats = [
    {
      value: t.stats.coreAreas.value,
      title: t.stats.coreAreas.title,
      description: t.stats.coreAreas.description,
      icon: Grid2X2,
    },
    {
      value: t.stats.languages.value,
      title: t.stats.languages.title,
      description: t.stats.languages.description,
      icon: Languages,
    },
    {
      value: t.stats.farmerFocused.value,
      title: t.stats.farmerFocused.title,
      description: t.stats.farmerFocused.description,
      icon: Sprout,
    },
    {
      value: t.stats.platform.value,
      title: t.stats.platform.title,
      description: t.stats.platform.description,
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="border-y border-slate-200/80 bg-white py-2">
      <div className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 px-8 sm:px-10 lg:px-16 xl:px-20">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
              }}
              className="group flex items-start gap-4 border-b border-slate-100 px-6 py-7 transition-colors hover:bg-green-50/30 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-r lg:last:border-r-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-green-100">
                <Icon size={20} strokeWidth={2} />
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-950">
                    {stat.value}
                  </span>
                </div>

                <h3 className="mt-0.5 text-sm font-semibold text-slate-800">
                  {stat.title}
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default TrustStats;
