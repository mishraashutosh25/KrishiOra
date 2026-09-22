import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  Receipt,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

const categories = [
  {
    name: "Seeds & Inputs",
    amount: "₹18,400",
    percentage: 38,
    width: "w-[38%]",
  },
  {
    name: "Labour",
    amount: "₹14,200",
    percentage: 29,
    width: "w-[29%]",
  },
  {
    name: "Equipment",
    amount: "₹10,200",
    percentage: 21,
    width: "w-[21%]",
  },
  {
    name: "Other",
    amount: "₹5,400",
    percentage: 12,
    width: "w-[12%]",
  },
];

const topExpenses = [
  {
    title: "Fertilizer",
    category: "Seeds & Inputs",
    amount: "₹8,400",
  },
  {
    title: "Farm Labour",
    category: "Labour",
    amount: "₹6,200",
  },
  {
    title: "Irrigation",
    category: "Equipment",
    amount: "₹4,800",
  },
];

const ExpenseIntelligence = () => {
  const { t } = useTranslation();

  return (
    <section
      id="expense-intelligence"
      className="relative overflow-hidden bg-slate-950 py-20 text-white sm:py-24"
    >
      {/* Background Glows */}
      <div aria-hidden="true" className="pointer-events-none absolute left-[-180px] top-[-120px] h-[450px] w-[450px] rounded-full bg-green-900/20 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-[-180px] right-[-100px] h-[500px] w-[500px] rounded-full bg-emerald-900/20 blur-3xl" />

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
            <span className="h-2 w-2 rounded-full bg-green-400" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-green-400">
              {t.expense.badge}
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
            {t.expense.headline1}
            <br />
            <span className="text-green-400">{t.expense.headline2}</span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            {t.expense.subheadline}
          </p>
        </motion.div>

        {/* Dashboard Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-12 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/40 backdrop-blur-sm"
        >
          {/* Top Bar */}
          <div className="flex flex-col justify-between gap-3 border-b border-white/10 px-6 py-4.5 sm:flex-row sm:items-center sm:px-8">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Expense Overview
              </p>
              <h3 className="mt-0.5 text-base font-semibold text-white sm:text-lg">
                August 2026
              </h3>
            </div>

            <button
              type="button"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Receipt size={14} />
              View all expenses
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            {/* Left Column */}
            <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Expenses</p>
                  <p className="mt-1 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                    ₹48,200
                  </p>
                  <div className="mt-2.5 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-400/10 px-2 py-0.5 font-semibold text-green-400 text-[11px]">
                      <TrendingDown size={12} />
                      8.4%
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      compared to last month
                    </span>
                  </div>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-400/10 text-green-400">
                  <CircleDollarSign size={22} strokeWidth={1.8} />
                </div>
              </div>

              {/* Spending Trend SVG Chart */}
              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-300">
                    Spending trend
                  </p>
                  <span className="text-[10px] text-slate-500">
                    Last 6 months
                  </span>
                </div>

                <div className="relative h-40">
                  <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
                    {[1, 2, 3, 4].map((line) => (
                      <div key={line} className="border-t border-white/5" />
                    ))}
                  </div>

                  <svg
                    viewBox="0 0 600 170"
                    className="absolute inset-0 h-full w-full overflow-visible"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#4ADE80" stopOpacity="0" />
                      </linearGradient>
                    </defs>

                    <motion.path
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      d="M0 130 C45 122, 60 118, 100 125 S155 92, 205 105 S260 75, 310 91 S365 65, 415 75 S470 55, 520 62 S570 42, 600 30 L600 170 L0 170 Z"
                      fill="url(#expenseGradient)"
                      className="text-green-400"
                    />
                    <motion.path
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      d="M0 130 C45 122, 60 118, 100 125 S155 92, 205 105 S260 75, 310 91 S365 65, 415 75 S470 55, 520 62 S570 42, 600 30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-green-400 drop-shadow-[0_4px_12px_rgba(74,222,128,0.3)]"
                    />
                  </svg>
                </div>

                <div className="mt-2.5 flex justify-between text-[10px] text-slate-500">
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                  <span>Jul</span>
                  <span>Aug</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">
                    Category analysis
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    Where your money is being spent
                  </p>
                </div>
                <BarChart3 size={18} className="text-green-400" strokeWidth={1.8} />
              </div>

              {/* Categories Progress */}
              <div className="mt-6 space-y-4">
                {categories.map((category, index) => (
                  <div key={category.name}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-300">
                        {category.name}
                      </span>
                      <span className="font-semibold text-white">
                        {category.amount}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${category.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.7,
                          delay: 0.2 + index * 0.08,
                        }}
                        className={`h-full rounded-full bg-green-400 ${category.width}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Top Expenses List */}
              <div className="mt-7 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">
                    Top expenses
                  </p>
                  <ArrowUpRight size={15} className="text-slate-400" />
                </div>

                <div className="mt-3.5 space-y-2.5">
                  {topExpenses.map((expense) => (
                    <div
                      key={expense.title}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-slate-400">
                          <Receipt size={13} />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-200">
                            {expense.title}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {expense.category}
                          </p>
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-white">
                        {expense.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Callout */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-400/10 text-green-400">
              <TrendingUp size={16} />
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {t.expense.calloutText}{" "}
              <span className="font-semibold text-white">
                {t.expense.calloutHighlight}
              </span>
            </p>
          </div>

          <a
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 transition-colors hover:text-green-300"
          >
            {t.expense.startTracking}
            <ArrowUpRight size={15} />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ExpenseIntelligence;
