import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const defaultFaq = {
  title: "Frequently Asked Questions",
  questions: [
    {
      q: "Is KrishiOra free to use?",
      a: "Yes! KrishiOra provides free core farm, crop, and expense management tools designed specifically for Indian farmers."
    },
    {
      q: "Which languages are supported?",
      a: "KrishiOra supports 8 languages: English, Punjabi, Hindi, Marathi, Gujarati, Tamil, Telugu, and Bengali."
    },
    {
      q: "How does expense tracking help my farm?",
      a: "By recording expenses per crop cycle and category (seeds, fertilizers, diesel, labour), you get actionable seasonal insights to optimize your farming profits."
    },
    {
      q: "Can I use KrishiOra on my mobile phone?",
      a: "Absolutely! KrishiOra is fully responsive and optimized for seamless use on smartphones and tablets in the field."
    }
  ]
};

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { t } = useTranslation();
  const faqData = t?.faq || defaultFaq;
  const questionsList = faqData?.questions || defaultFaq.questions;

  return (
    <section className="relative overflow-hidden bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-green-700">
            FAQ
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {faqData.title || defaultFaq.title}
          </p>
        </div>

        <div className="mt-16 space-y-4">
          {questionsList.map((faq: any, index: number) => {
            const isOpen = openIndex === index;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${
                  isOpen ? "border-green-300 bg-white shadow-md shadow-green-900/5" : "border-slate-200 bg-white/50 hover:bg-white"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-inset"
                >
                  <span className={`font-semibold text-lg transition-colors duration-300 ${
                    isOpen ? "text-green-900" : "text-slate-800"
                  }`}>
                    {faq.q}
                  </span>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    isOpen ? "bg-green-100 text-green-700 rotate-180" : "bg-slate-100 text-slate-400"
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>
                
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed border-t border-slate-100 mt-2">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
