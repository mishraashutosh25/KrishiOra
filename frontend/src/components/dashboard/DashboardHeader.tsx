import { Link } from "react-router-dom";
import { Plus, Receipt, Calendar } from "lucide-react";

interface DashboardHeaderProps {
  userName?: string;
}

export const DashboardHeader = ({ userName = "Farmer" }: DashboardHeaderProps) => {
  const currentDate = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200/80 mb-7">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-green-800 mb-1">
          <Calendar size={13} className="text-green-700" />
          <span>{currentDate}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
          Good morning, {userName}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Here is what is happening across your farms and crops today.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:self-center">
        <Link
          to="/expenses"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 shadow-2xs"
        >
          <Receipt size={15} className="text-slate-500" />
          <span>Record Expense</span>
        </Link>

        <Link
          to="/crops"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-green-700 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-green-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 shadow-2xs active:scale-[0.98]"
        >
          <Plus size={15} />
          <span>Add Crop</span>
        </Link>
      </div>
    </div>
  );
};

export default DashboardHeader;
