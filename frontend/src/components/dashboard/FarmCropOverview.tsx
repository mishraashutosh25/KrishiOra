import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Sprout, ArrowRight, Droplets, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import Badge from "../ui/Badge";
import lifecycleService from "../../services/lifecycle.service";
import farmService from "../../services/farm.service";
import type { CropCycle, CropProgressResponse } from "../../types/lifecycle.types";
import type { Farm } from "../../types/farm";

export const FarmCropOverview = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [activeCycle, setActiveCycle] = useState<CropCycle | null>(null);
  const [cycleProgress, setCycleProgress] = useState<CropProgressResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadOverviewData = async () => {
      try {
        const [farmList, cycles] = await Promise.all([
          farmService.getFarms().catch(() => []),
          lifecycleService.getActiveCycles().catch(() => []),
        ]);

        if (!isMounted) return;
        setFarms(farmList);

        if (cycles.length > 0) {
          const primary = cycles[0];
          setActiveCycle(primary);
          try {
            const prog = await lifecycleService.getCycleProgress(primary.id);
            if (isMounted) setCycleProgress(prog);
          } catch (e) {
            console.error("Failed to load progress for primary cycle", e);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard farm/crop overview data", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOverviewData();
    return () => {
      isMounted = false;
    };
  }, []);

  const primaryFarm = farms[0];

  return (
    <section aria-label="Farm and Crop Operations Overview" className="mb-7">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Card 1: Primary Farm Profile */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100/80 text-green-800">
                  <MapPin size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {primaryFarm ? primaryFarm.name : "Primary Farm Plot"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {primaryFarm
                      ? `${primaryFarm.district || primaryFarm.location}, ${primaryFarm.state || "India"}`
                      : "India"}
                  </p>
                </div>
              </div>

              <Badge variant="healthy" dot>
                Active
              </Badge>
            </div>

            {/* Farm Details Grid */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Land Area
                </p>
                <p className="mt-0.5 text-base font-extrabold text-slate-900">
                  {primaryFarm ? `${primaryFarm.areaAcres || 0} Acres` : "14.2 Acres"}
                </p>
                <p className="text-[10px] text-slate-500">
                  {farms.length} plot{farms.length === 1 ? "" : "s"} registered
                </p>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-3 border border-slate-100">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Soil Profile
                </p>
                <p className="mt-0.5 text-base font-extrabold text-slate-900">
                  {primaryFarm?.soilType || "Alluvial Loam"}
                </p>
                <p className="text-[10px] text-slate-500">Optimal pH: 7.2</p>
              </div>
            </div>

            {/* Infrastructure & Irrigation */}
            <div className="mt-3.5 flex items-center justify-between rounded-xl bg-green-50/50 p-3 border border-green-100">
              <div className="flex items-center gap-2">
                <Droplets size={16} className="text-green-700 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-green-950">
                    {primaryFarm?.irrigationType || "Solar Drip & Deep Borewell"}
                  </p>
                  <p className="text-[10px] text-green-800/80">
                    Primary source operational
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-green-900 bg-white px-2 py-0.5 rounded border border-green-200">
                Operational
              </span>
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {farms.length} {farms.length === 1 ? "farm" : "farms"} in total
            </span>
            <Link
              to="/farms"
              className="inline-flex items-center gap-1 font-semibold text-green-800 hover:text-green-950 transition-colors"
            >
              <span>Manage all farms</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Card 2: Active Crop Lifecycle Tracker */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100/80 text-green-800">
                  <Sprout size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {activeCycle
                      ? `${activeCycle.crop_name} (${activeCycle.variety_name || activeCycle.variety_code || "Standard"})`
                      : "Sharbati Wheat (HD-2967)"}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {activeCycle
                      ? `${activeCycle.allocated_area} ${activeCycle.area_unit}`
                      : "Field Plot 4A · 8.5 Acres"}
                  </p>
                </div>
              </div>

              <Badge variant="healthy" dot>
                {activeCycle ? activeCycle.status : "Optimal"}
              </Badge>
            </div>

            {/* Growth Stage Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">
                  {cycleProgress?.stages?.find((s) => s.status === "IN_PROGRESS")?.stage_name ||
                    cycleProgress?.stages?.[0]?.stage_name ||
                    "Vegetative Stage"}
                </span>
                <span className="font-bold text-slate-900">
                  {cycleProgress
                    ? `${cycleProgress.completion_percentage}% Done`
                    : "Day 44 of 120"}
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-green-600 transition-all duration-300"
                  style={{
                    width: `${cycleProgress ? cycleProgress.completion_percentage : 38}%`,
                  }}
                />
              </div>

              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>
                  Sown: {activeCycle?.sowing_date || "Nov 12"}
                </span>
                <span className="text-green-800 font-semibold">
                  {cycleProgress?.drift_days !== undefined
                    ? cycleProgress.drift_days === 0
                      ? "On Schedule"
                      : `${cycleProgress.drift_days > 0 ? "+" : ""}${cycleProgress.drift_days}d Drift`
                    : "Optimal"}
                </span>
                <span>
                  Harvest: {activeCycle?.target_harvest_date || "Mar 20"}
                </span>
              </div>
            </div>

            {/* Scheduled Operation Highlight */}
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
              {loading ? (
                <Clock size={16} className="text-slate-400 mt-0.5 shrink-0" />
              ) : (
                <CheckCircle2 size={16} className="text-green-700 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Deterministic Milestone
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {cycleProgress?.operational_projected_harvest_date
                    ? `Projected Harvest: ${cycleProgress.operational_projected_harvest_date} (${cycleProgress.disclaimer})`
                    : "ICAR agronomic schedule active with drift monitoring."}
                </p>
              </div>
            </div>
          </div>

          {/* Card Footer Link */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {activeCycle ? "Deterministic Engine Active" : "No cycle active"}
            </span>
            <Link
              to="/crops"
              className="inline-flex items-center gap-1 font-semibold text-green-800 hover:text-green-950 transition-colors"
            >
              <span>View crop lifecycle</span>
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FarmCropOverview;
