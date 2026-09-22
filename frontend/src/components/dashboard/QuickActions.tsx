import { Link } from "react-router-dom";
import { PlusCircle, Sprout, Receipt, BarChart3, ChevronRight, Calculator, Sparkles } from "lucide-react";

interface QuickActionsProps {
  onOpenDosageCalculator?: () => void;
}

export const QuickActions = ({ onOpenDosageCalculator }: QuickActionsProps) => {
  const actions = [
    {
      title: "Register New Farm",
      description: "Add a new field plot, soil type, and acreage",
      href: "/farms",
      icon: PlusCircle,
      accent: "text-green-800 bg-green-50 border-green-200/70",
    },
    {
      title: "Add Seasonal Crop",
      description: "Track sowing date, variety, and stage milestones",
      href: "/crops",
      icon: Sprout,
      accent: "text-emerald-800 bg-emerald-50 border-emerald-200/70",
    },
    {
      title: "Record Farm Expense",
      description: "Log fertilizer, seed, diesel, or labour expenditure",
      href: "/expenses",
      icon: Receipt,
      accent: "text-amber-800 bg-amber-50 border-amber-200/70",
    },
    {
      title: "Explore Analytics",
      description: "Review cost-per-acre and seasonal performance",
      href: "/analytics",
      icon: BarChart3,
      accent: "text-sky-800 bg-sky-50 border-sky-200/70",
    },
  ];

  return (
    <section aria-label="Quick Farm Actions" className="mb-2">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quick Actions & Operations
        </h2>
        <span className="text-[11px] text-slate-400">Jump directly to workspace</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5 outline-none focus-visible:ring-2 focus-visible:ring-green-700"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${action.accent}`}>
                    <Icon size={18} />
                  </div>
                  <ChevronRight size={15} className="text-slate-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-slate-700" />
                </div>

                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-green-900 transition-colors">
                  {action.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 leading-snug">
                  {action.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ICAR Dosage Calculator Hero Trigger Banner */}
      {onOpenDosageCalculator && (
        <div
          onClick={onOpenDosageCalculator}
          className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100/60 shadow-xs cursor-pointer hover:shadow-md hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xs group-hover:scale-105 transition-transform">
              <Calculator size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-extrabold text-emerald-950">
                  ICAR Fertilizer & Seed Rate Dosage Calculator
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                  खाद व बीज कैलकुलेटर
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Calculate scientific DAP, Urea, Potash bags, seed kg, and estimated cost for your plot acreage.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-white/80 border border-emerald-200 px-3.5 py-2 rounded-xl group-hover:bg-emerald-700 group-hover:text-white transition-colors self-start sm:self-auto shrink-0 shadow-2xs">
            <Sparkles size={14} />
            <span>Open Calculator</span>
            <ChevronRight size={14} />
          </div>
        </div>
      )}
    </section>
  );
};

export default QuickActions;
