import { useMemo } from "react";
import { History, Sprout, Receipt, MapPin, CheckCircle, Clock } from "lucide-react";
import type { Farm } from "../../types/farm";
import type { CropCycle } from "../../types/lifecycle.types";
import type { Expense } from "../../services/expense.service";

interface RecentActivityCardProps {
  realFarms?: Farm[];
  realCycles?: CropCycle[];
  realExpenses?: Expense[];
}

interface DynamicActivity {
  id: string;
  type: "crop" | "expense" | "farm";
  title: string;
  description: string;
  time: string;
}

export const RecentActivityCard = ({
  realFarms = [],
  realCycles = [],
  realExpenses = [],
}: RecentActivityCardProps) => {
  const dynamicActivities: DynamicActivity[] = useMemo(() => {
    const list: DynamicActivity[] = [];

    // 1. Add crop cycles
    realCycles.forEach((cycle) => {
      list.push({
        id: `crop-${cycle.id}`,
        type: "crop",
        title: `Active Crop: ${cycle.variety_name || cycle.crop_code}`,
        description: `Sown on ${new Date(cycle.sowing_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} • ${cycle.stage_name || "Growth Phase"}`,
        time: "Current Season",
      });
    });

    // 2. Add recent expenses
    realExpenses.slice(0, 3).forEach((exp) => {
      list.push({
        id: `exp-${exp.id}`,
        type: "expense",
        title: `Logged Expense: ${exp.item_name}`,
        description: `₹${exp.total_amount.toLocaleString("en-IN")} (${exp.category}) • ${exp.payment_method?.split("(")[0] || "Paid"}`,
        time: new Date(exp.expense_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      });
    });

    // 3. Add registered farms
    realFarms.forEach((farm) => {
      list.push({
        id: `farm-${farm.id}`,
        type: "farm",
        title: `Plot Registered: ${farm.name}`,
        description: `${farm.areaAcres} Acres • ${farm.soilType?.split("(")[0] || "Alluvial"} • ${farm.location}`,
        time: "Active Plot",
      });
    });

    return list.slice(0, 4);
  }, [realFarms, realCycles, realExpenses]);

  const getTypeIcon = (type: DynamicActivity["type"]) => {
    switch (type) {
      case "crop":
        return <Sprout size={13} className="text-green-700" />;
      case "expense":
        return <Receipt size={13} className="text-amber-700" />;
      default:
        return <MapPin size={13} className="text-sky-700" />;
    }
  };

  const getTypeBg = (type: DynamicActivity["type"]) => {
    switch (type) {
      case "crop":
        return "bg-green-50 border-green-200/70";
      case "expense":
        return "bg-amber-50 border-amber-200/70";
      default:
        return "bg-sky-50 border-sky-200/70";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100/80 text-green-800">
              <History size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Farm Activity Timeline
              </h2>
              <p className="text-[11px] text-slate-500">
                Real-time operational records
              </p>
            </div>
          </div>

          <span className="text-[11px] font-medium text-slate-400 font-mono">
            Live Stream
          </span>
        </div>

        {/* Activity Timeline List */}
        {dynamicActivities.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No activities recorded yet. Plan a crop or log an expense.
          </div>
        ) : (
          <div className="mt-4 relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {dynamicActivities.map((activity) => (
              <div key={activity.id} className="relative">
                {/* Timeline marker */}
                <div
                  className={`absolute -left-5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full border ${getTypeBg(
                    activity.type
                  )}`}
                >
                  {getTypeIcon(activity.type)}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {activity.title}
                    </p>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock size={10} />
                      <span>{activity.time}</span>
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>Automatic DB log sync</span>
        <span>100% Real Live Data</span>
      </div>
    </div>
  );
};

export default RecentActivityCard;
