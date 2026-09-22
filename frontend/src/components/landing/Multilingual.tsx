import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Globe2,
  Languages,
  Sprout,
} from "lucide-react";
import { useState } from "react";

const languages = [
  {
    id: "english",
    name: "English",
    nativeName: "English",
    greeting: "Manage your farm with ease",
    description:
      "Keep your farms, crops and expenses organized in one simple place.",
    cta: "View Dashboard",
  },
  {
    id: "punjabi",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    greeting: "ਆਪਣੇ ਖੇਤ ਨੂੰ ਆਸਾਨੀ ਨਾਲ ਸੰਭਾਲੋ",
    description:
      "ਆਪਣੇ ਖੇਤਾਂ, ਫਸਲਾਂ ਅਤੇ ਖਰਚਿਆਂ ਨੂੰ ਇੱਕ ਹੀ ਥਾਂ ਤੇ ਆਸਾਨੀ ਨਾਲ ਸੰਭਾਲੋ।",
    cta: "ਡੈਸ਼ਬੋਰਡ ਵੇਖੋ",
  },
  {
    id: "marathi",
    name: "Marathi",
    nativeName: "मराठी",
    greeting: "तुमचे शेत सहजपणे व्यवस्थापित करा",
    description:
      "तुमची शेती, पिके आणि खर्च एकाच ठिकाणी व्यवस्थित सांभाळा.",
    cta: "डॅशबोर्ड पहा",
  },
  {
    id: "bengali",
    name: "Bengali",
    nativeName: "বাংলা",
    greeting: "সহজেই আপনার খামার পরিচালনা করুন",
    description:
      "আপনার খামার, ফসল এবং খরচ এক জায়গায় সহজেই পরিচালনা করুন।",
    cta: "ড্যাশবোর্ড দেখুন",
  },
  {
    id: "gujarati",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    greeting: "તમારા ખેતરને સરળતાથી સંચાલિત કરો",
    description:
      "તમારા ખેતરો, પાક અને ખર્ચને એક જ જગ્યાએ સરળતાથી સંભાળો.",
    cta: "ડેશબોર્ડ જુઓ",
  },
  {
    id: "tamil",
    name: "Tamil",
    nativeName: "தமிழ்",
    greeting: "உங்கள் பண்ணையை எளிதாக நிர்வகிக்கவும்",
    description:
      "உங்கள் பண்ணைகள், பயிர்கள் மற்றும் செலவுகளை ஒரே இடத்தில் நிர்வகிக்கவும்.",
    cta: "டாஷ்போர்டைப் பார்க்கவும்",
  },
  {
    id: "telugu",
    name: "Telugu",
    nativeName: "తెలుగు",
    greeting: "మీ వ్యవసాయాన్ని సులభంగా నిర్వహించండి",
    description:
      "మీ పొలాలు, పంటలు మరియు ఖర్చులను ఒకే చోట సులభంగా నిర్వహించండి.",
    cta: "డాష్బోర్డ్ చూడండి",
  },
];

const Multilingual = () => {
  const [activeLanguage, setActiveLanguage] = useState("english");

  const selectedLanguage =
    languages.find((language) => language.id === activeLanguage) ??
    languages[0];

  return (
    <section
      id="languages"
      className="relative overflow-hidden bg-white py-20 sm:py-24"
    >
      {/* Background Atmosphere */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-180px] top-20 h-[420px] w-[420px] rounded-full bg-green-50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-200px] right-[-100px] h-[450px] w-[450px] rounded-full bg-lime-50 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-8 sm:px-10 lg:px-16 xl:px-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-green-700">
            <Languages size={14} />
            Built for India
          </div>

          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl lg:text-5xl">
            Your farm.
            <br />
            <span className="text-green-700">Your language.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Technology should not be a language barrier. KrishiOra is designed
            to make farm management more accessible with support for multiple
            Indian languages.
          </p>
        </motion.div>

        {/* Interactive Language Selector + Live Preview */}
        <div className="mt-12 grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Language Selector Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="px-3 pb-3 pt-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Select language
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Choose what feels comfortable.
              </p>
            </div>

            <div className="space-y-1">
              {languages.map((language) => {
                const isActive = language.id === activeLanguage;

                return (
                  <button
                    key={language.id}
                    type="button"
                    onClick={() => setActiveLanguage(language.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 ${
                      isActive
                        ? "bg-green-700 text-white shadow-md shadow-green-900/10"
                        : "text-slate-700 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-semibold">
                        {language.nativeName}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] ${
                          isActive ? "text-green-100" : "text-slate-400"
                        }`}
                      >
                        {language.name}
                      </p>
                    </div>

                    {isActive && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Product Preview Pane */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="relative overflow-hidden rounded-[28px] bg-green-950 p-6 shadow-2xl shadow-green-950/10 sm:p-8 lg:p-10"
          >
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-green-800/30" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-emerald-900/30" />

            <div className="relative">
              {/* Preview Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-green-300">
                    <Sprout size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      KrishiOra
                    </p>
                    <p className="text-[10px] text-green-200/60">
                      {selectedLanguage.nativeName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                  <Globe2 size={12} className="text-green-300" />
                  <span className="text-[10px] font-medium text-green-100">
                    {selectedLanguage.name}
                  </span>
                </div>
              </div>

              {/* Localized Content Card */}
              <motion.div
                key={selectedLanguage.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid gap-6 py-8 lg:grid-cols-[1fr_260px] lg:items-center"
              >
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-green-300">
                    {selectedLanguage.nativeName}
                  </span>
                  <h3 className="mt-3 max-w-xl text-2xl font-bold leading-tight text-white sm:text-3xl">
                    {selectedLanguage.greeting}
                  </h3>
                  <p className="mt-3 max-w-lg text-xs sm:text-sm leading-6 text-green-100/70">
                    {selectedLanguage.description}
                  </p>

                  <button
                    type="button"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-green-900 transition-all hover:bg-green-50"
                  >
                    {selectedLanguage.cta}
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* Mini Stat Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-wider text-green-200/50">
                        {selectedLanguage.name}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-white">
                        Farm Overview
                      </p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-400" />
                  </div>

                  <div className="mt-4 space-y-2.5">
                    <MiniStat label="Farms" value="03" />
                    <MiniStat label="Active Crops" value="06" />
                    <MiniStat label="Expenses" value="₹48.2K" />
                  </div>
                </div>
              </motion.div>

              {/* Supported Pills */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex flex-wrap items-center gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.id}
                      type="button"
                      onClick={() => setActiveLanguage(language.id)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-medium transition-colors ${
                        language.id === activeLanguage
                          ? "bg-green-400 text-green-950"
                          : "bg-white/5 text-green-100/60 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {language.nativeName}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-8 max-w-3xl text-center"
        >
          <p className="text-xs sm:text-sm leading-6 text-slate-500">
            <span className="font-semibold text-slate-800">
              7 languages.
            </span>{" "}
            One goal — make digital farm management easier and more accessible
            for farmers across India.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

const MiniStat = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.035] px-3 py-2">
    <span className="text-[10px] text-green-100/50">{label}</span>
    <span className="text-xs font-bold text-white">{value}</span>
  </div>
);

export default Multilingual;
