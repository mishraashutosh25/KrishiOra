import { motion, useReducedMotion } from "framer-motion";
import { Leaf, Sprout, Sun } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

export const HeroVisual = () => {
  const shouldReduceMotion = useReducedMotion();
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : 30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
    },
  };

  return (
    <div className="relative w-full max-w-[580px] mx-auto lg:max-w-none lg:h-[500px]">
      
      {/* Background image / graphic */}
      <div className="absolute -right-10 top-0 bottom-0 w-[100%] lg:w-[120%] z-0 overflow-visible pointer-events-none">
        <img 
          src="/hero-rice-new.jpg" 
          alt="Golden sunset over a wheat field" 
          className="w-full h-full object-cover object-center opacity-80"
          style={{ maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)' }}
        />
      </div>

      {/* Cards Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col gap-5 pt-8 lg:pt-16 lg:pl-10"
      >
        {/* Card 1 */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ x: -5, transition: { duration: 0.2 } }}
          className="flex items-center gap-5 rounded-2xl bg-white/95 p-5 pr-6 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] backdrop-blur-md border border-slate-100"
        >
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{t.nav.featItems.farmManagement.title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.nav.featItems.farmManagement.description}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-700 shadow-inner">
            <Leaf size={24} />
          </div>
        </motion.div>

        {/* Card 2 */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ x: -5, transition: { duration: 0.2 } }}
          className="flex items-center gap-5 rounded-2xl bg-white/95 p-5 pr-6 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] backdrop-blur-md border border-slate-100 lg:-ml-6"
        >
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{t.nav.featItems.cropLifecycle.title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.nav.featItems.cropLifecycle.description}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-amber-700 shadow-inner">
            <Sprout size={24} />
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div 
          variants={cardVariants}
          whileHover={{ x: -5, transition: { duration: 0.2 } }}
          className="flex items-center gap-5 rounded-2xl bg-white/95 p-5 pr-6 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] backdrop-blur-md border border-slate-100 lg:-ml-12"
        >
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{t.nav.featItems.expenseIntelligence.title}</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.nav.featItems.expenseIntelligence.description}</p>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-50 text-amber-500 shadow-inner">
            <Sun size={24} />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default HeroVisual;
