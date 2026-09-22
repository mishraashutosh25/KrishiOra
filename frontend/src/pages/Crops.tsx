import { useState, useEffect, useCallback } from "react";
import {
  Sprout,
  Plus,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Wind,
  Info,
  CloudRain,
  Sun,
  Cloud,
  Droplets,
  AlertTriangle,
  Zap,
  RefreshCw,
  Sparkles,
  Calculator,
  Bug,
} from "lucide-react";
import lifecycleService from "../services/lifecycle.service";
import farmService from "../services/farm.service";
import weatherService, {
  type WeatherQueryResult,
  type RuleEvaluationResult,
} from "../services/weather.service";
import type {
  CropCycle,
  FarmTask,
  CropProgressResponse,
  CropKnowledge,
  CropVariety,
} from "../types/lifecycle.types";
import type { Farm } from "../types/farm";
import TaskExecutionModal from "../components/tasks/TaskExecutionModal";
import DosageCalculatorModal from "../components/crop/DosageCalculatorModal";
import PestDiseaseAdvisorModal from "../components/crop/PestDiseaseAdvisorModal";

// Default fallback ICAR knowledge if database catalog is unseeded
const FALLBACK_CATALOG: CropKnowledge[] = [
  { id: "wheat", crop_code: "WHEAT_BREAD", common_name: "Bread Wheat (गेहूं)", season_category: "Rabi", source_reference: "ICAR-PAU", knowledge_version: "1.0", is_active: true },
  { id: "mustard", crop_code: "MUSTARD_INDIAN", common_name: "Indian Mustard (सरसों)", season_category: "Rabi", source_reference: "ICAR-DRMR", knowledge_version: "1.0", is_active: true },
  { id: "chickpea", crop_code: "CHICKPEA_DESI", common_name: "Desi Chickpea (चना)", season_category: "Rabi", source_reference: "ICAR-IIPR", knowledge_version: "1.0", is_active: true },
];

const FALLBACK_VARIETIES: Record<string, CropVariety[]> = {
  WHEAT_BREAD: [
    { id: "hd2967", crop_id: "wheat", variety_code: "HD_2967", variety_name: "HD-2967 (High Yield)", typical_duration_days: 140, min_duration_days: 135, max_duration_days: 145, source_reference: "ICAR", is_active: true },
    { id: "pbw343", crop_id: "wheat", variety_code: "PBW_343", variety_name: "PBW-343 (Rust Tolerant)", typical_duration_days: 135, min_duration_days: 130, max_duration_days: 140, source_reference: "PAU", is_active: true },
  ],
  MUSTARD_INDIAN: [
    { id: "rh749", crop_id: "mustard", variety_code: "RH_749", variety_name: "RH-749 (High Oil)", typical_duration_days: 145, min_duration_days: 140, max_duration_days: 150, source_reference: "ICAR", is_active: true },
    { id: "pusabold", crop_id: "mustard", variety_code: "PUSA_BOLD", variety_name: "Pusa Bold (Early)", typical_duration_days: 135, min_duration_days: 130, max_duration_days: 140, source_reference: "IARI", is_active: true },
  ],
  CHICKPEA_DESI: [
    { id: "jg11", crop_id: "chickpea", variety_code: "JG_11", variety_name: "JG-11 (Wilt Resistant)", typical_duration_days: 105, min_duration_days: 100, max_duration_days: 110, source_reference: "ICAR", is_active: true },
    { id: "pusa362", crop_id: "chickpea", variety_code: "PUSA_362", variety_name: "Pusa-362 (Bold Grain)", typical_duration_days: 145, min_duration_days: 140, max_duration_days: 150, source_reference: "IARI", is_active: true },
  ],
};

export const Crops = () => {
  // State
  const [farms, setFarms] = useState<Farm[]>([]);
  const [cycles, setCycles] = useState<CropCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [progress, setProgress] = useState<CropProgressResponse | null>(null);
  const [tasks, setTasks] = useState<FarmTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Weather & Smart Advisory State
  const [weatherForecast, setWeatherForecast] = useState<WeatherQueryResult | null>(null);
  const [ruleEvaluation, setRuleEvaluation] = useState<RuleEvaluationResult | null>(null);
  const [weatherLoading, setWeatherLoading] = useState<boolean>(false);
  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);
  const [smartSuccessMsg, setSmartSuccessMsg] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | undefined>(undefined);

  // Modal State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isDosageModalOpen, setIsDosageModalOpen] = useState<boolean>(false);
  const [isPestModalOpen, setIsPestModalOpen] = useState<boolean>(false);
  const [executingTask, setExecutingTask] = useState<FarmTask | null>(null);

  // New Cycle Form State
  const [cropCatalog, setCropCatalog] = useState<CropKnowledge[]>(FALLBACK_CATALOG);
  const [varieties, setVarieties] = useState<CropVariety[]>(FALLBACK_VARIETIES["WHEAT_BREAD"]);
  const [formFarmId, setFormFarmId] = useState<string>("");
  const [formCropCode, setFormCropCode] = useState<string>("WHEAT_BREAD");
  const [formVarietyCode, setFormVarietyCode] = useState<string>("HD_2967");
  const [formSowingDate, setFormSowingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formArea, setFormArea] = useState<number>(5);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Attempt browser geolocation once
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Fallback coords used automatically by weatherService
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Load initial data
  const loadInitial = async () => {
    setLoading(true);
    try {
      const [fetchedFarms, fetchedCycles, fetchedCatalog] = await Promise.all([
        farmService.getFarms().catch(() => []),
        lifecycleService.getActiveCycles().catch(() => []),
        lifecycleService.getCropCatalog().catch(() => []),
      ]);

      setFarms(fetchedFarms);
      setCycles(fetchedCycles);

      const activeCatalog = fetchedCatalog.length > 0 ? fetchedCatalog : FALLBACK_CATALOG;
      setCropCatalog(activeCatalog);

      if (activeCatalog.length > 0) {
        setFormCropCode(activeCatalog[0].crop_code);
      }

      if (fetchedFarms.length > 0) {
        setFormFarmId(fetchedFarms[0].id);
      }

      if (fetchedCycles.length > 0) {
        setSelectedCycleId(fetchedCycles[0].id);
      }
    } catch (err) {
      console.error("Failed to load crop initial data", err);
    } finally {
      setLoading(false);
    }
  };

  // Load varieties when selected crop changes
  useEffect(() => {
    if (formCropCode) {
      lifecycleService
        .getVarieties(formCropCode)
        .then((vars) => {
          const list = vars && vars.length > 0 ? vars : (FALLBACK_VARIETIES[formCropCode] || []);
          setVarieties(list);
          if (list.length > 0) {
            setFormVarietyCode(list[0].variety_code);
          }
        })
        .catch(() => {
          const fallback = FALLBACK_VARIETIES[formCropCode] || [];
          setVarieties(fallback);
          if (fallback.length > 0) {
            setFormVarietyCode(fallback[0].variety_code);
          }
        });
    }
  }, [formCropCode]);

  // Load selected cycle details (progress, tasks, weather forecast, rule evaluations)
  const loadCycleDetails = useCallback(async (cycleId: string) => {
    try {
      const [prog, taskList] = await Promise.all([
        lifecycleService.getCycleProgress(cycleId).catch(() => null),
        lifecycleService.getCycleTasks(cycleId).catch(() => []),
      ]);
      setProgress(prog);
      setTasks(taskList || []);

      // Load Weather & Rule Engine evaluation
      const currentCycle = cycles.find((c) => c.id === cycleId);
      const farmId = currentCycle?.farm_id || (farms.length > 0 ? farms[0].id : "default-farm");

      setWeatherLoading(true);
      const [forecastData, ruleData] = await Promise.all([
        weatherService.getFarmForecast(farmId, coords).catch(() => null),
        weatherService.evaluateCycle(cycleId, coords).catch(() => null),
      ]);
      setWeatherForecast(forecastData);
      setRuleEvaluation(ruleData);
    } catch (err) {
      console.error("Failed to load cycle progress/tasks/weather", err);
    } finally {
      setWeatherLoading(false);
    }
  }, [cycles, farms, coords]);

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (selectedCycleId) {
      loadCycleDetails(selectedCycleId);
    }
  }, [selectedCycleId, loadCycleDetails]);

  // Trigger 1-Click Smart Reschedule
  const handleSmartReschedule = async (
    taskId: string,
    targetDate: string,
    daysOffset: number = 2,
    ruleExplanation: string = "",
    ruleId?: string
  ) => {
    setReschedulingTaskId(taskId);
    setSmartSuccessMsg(null);
    try {
      const originalDate = new Date(targetDate);
      const newDateObj = new Date(originalDate.getTime() + daysOffset * 86400000);
      const newTargetDate = newDateObj.toISOString().split("T")[0];

      const reason = `Auto-rescheduled by Smart Weather Engine: ${ruleExplanation || `Shifted ${daysOffset} days away from adverse weather`}`;
      await weatherService.rescheduleTask(taskId, newTargetDate, reason, ruleId);

      setSmartSuccessMsg(`Task successfully moved to ${newTargetDate}! Lifecycle schedule aligned with weather.`);
      if (selectedCycleId) {
        await loadCycleDetails(selectedCycleId);
      }
      setTimeout(() => setSmartSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error("Smart Reschedule error:", err);
      alert(err.response?.data?.message || err.message || "Failed to auto-reschedule task.");
    } finally {
      setReschedulingTaskId(null);
    }
  };

  // Handle New Lifecycle Generation
  const handleGenerateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      let targetFarmId = formFarmId;

      // Auto-create farm if user does not have any farm yet
      if (!targetFarmId) {
        if (farms.length > 0) {
          targetFarmId = farms[0].id;
        } else {
          const autoFarm = await farmService.createFarm({
            name: "Main Farm Plot (5 Acres)",
            location: "Punjab, India",
            areaAcres: Number(formArea) || 5,
            state: "Punjab",
            district: "Ludhiana",
            soilType: "Black Alluvial",
            irrigationType: "Canal / Borewell",
          });
          const updatedFarms = await farmService.getFarms().catch(() => []);
          setFarms(updatedFarms);
          targetFarmId = autoFarm?.id || (updatedFarms.length > 0 ? updatedFarms[0]?.id : "");
        }
      }

      if (!targetFarmId) {
        throw new Error("Unable to initialize farm plot. Please try again.");
      }

      const result = await lifecycleService.generateCycle({
        farm_id: targetFarmId,
        crop_code: formCropCode,
        variety_code: formVarietyCode,
        sowing_date: formSowingDate,
        allocated_area: Number(formArea),
        area_unit: "acre",
      });

      // Reload cycles and select the newly created cycle
      const updatedCycles = await lifecycleService.getActiveCycles().catch(() => []);
      setCycles(updatedCycles);
      if (result && result.cycle?.id) {
        setSelectedCycleId(result.cycle.id);
      } else if (updatedCycles.length > 0) {
        setSelectedCycleId(updatedCycles[0]?.id || "");
      }
      setIsGenerateModalOpen(false);
    } catch (err: any) {
      console.error("Cycle Generation Error:", err);
      setFormError(err.response?.data?.message || err.message || "Failed to generate cycle. Check date and constraints.");
    } finally {
      setFormLoading(false);
    }
  };

  // Live estimated harvest date calculation
  const selectedVarietyObj = varieties.find((v) => v.variety_code === formVarietyCode) || varieties[0];
  const typicalDuration = selectedVarietyObj?.typical_duration_days || 140;
  const estimatedHarvestDate = formSowingDate
    ? new Date(new Date(formSowingDate).getTime() + typicalDuration * 86400000).toISOString().split("T")[0]
    : "N/A";

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterCategory === "ALL") return true;
    return t.category === filterCategory;
  });

  return (
    <div className="w-full pb-12 space-y-6">
      {/* 1. Header & Cycle Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-wider">
            <Sprout size={16} />
            <span>Deterministic Crop Lifecycle Engine</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Crop Operations & Milestone Tracker
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Governed by ICAR/PAU scientific agronomic standards and immutable execution history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {cycles.length > 0 && (
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
            >
              {cycles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.crop_name} ({c.variety_name || c.variety_code || "Standard"}) — {c.allocated_area} {c.area_unit}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setIsPestModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-800 shadow-2xs hover:bg-red-100 transition-all cursor-pointer"
          >
            <Bug size={15} className="text-red-600" />
            <span>कीट व रोग सलाह (Pest Advisory)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDosageModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
          >
            <Calculator size={15} className="text-emerald-700" />
            <span>खाद व बीज कैलकुलेटर (Dosage)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-green-800 transition-all cursor-pointer"
          >
            <Plus size={15} />
            <span>New Crop Plan</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
          Loading crop lifecycle state...
        </div>
      ) : cycles.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-700 mb-3 border border-green-200">
            <Sprout size={28} />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Active Crop Cycles Found</h2>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Generate your first scientific crop plan using ICAR standards. Select your crop, variety, and sowing date to automatically build stages and tasks.
          </p>
          <button
            type="button"
            onClick={() => setIsGenerateModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-green-800 transition-all cursor-pointer"
          >
            <Plus size={15} />
            Generate Crop Plan
          </button>
        </div>
      ) : (
        <>
          {/* 2. Operational Harvest Drift & Progress Summary */}
          {progress && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Progress Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Cycle Lifecycle Status
                  </span>
                  <div className="mt-1 flex items-center justify-between">
                    <h3 className="text-lg font-black text-slate-900">
                      {progress.status === "ACTIVE"
                        ? "Active Cultivation"
                        : progress.status === "HARVESTED"
                        ? "Harvested & Finalizing"
                        : progress.status}
                    </h3>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-extrabold text-green-800">
                      {progress.completion_percentage}% Done
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                      style={{ width: `${progress.completion_percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Sowing: {progress.sowing_date}</span>
                  <span>Planned Harvest: {progress.target_harvest_date}</span>
                </div>
              </div>

              {/* Operational Drift Card (Phase 7 hardened) */}
              <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-linear-to-br from-white to-green-50/30 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-green-700" />
                      <h3 className="text-sm font-bold text-slate-900">
                        Operational Projected Harvest Drift
                      </h3>
                    </div>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      Phase 7 Deterministic
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Original Planned</p>
                      <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                        {progress.target_harvest_date}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Projected Harvest</p>
                      <p className="text-sm font-extrabold text-green-700 mt-0.5">
                        {progress.operational_projected_harvest_date}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3 border border-slate-100 shadow-2xs col-span-2 sm:col-span-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Observed Drift</p>
                      <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                        {progress.drift_days > 0
                          ? `+${progress.drift_days} Days Delay`
                          : progress.drift_days < 0
                          ? `${progress.drift_days} Days Ahead`
                          : "0 Days (On Schedule)"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mandatory ICAR Disclaimer */}
                <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-500 bg-white/80 p-2 rounded-xl border border-slate-100">
                  <Info size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <p>{progress.disclaimer}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Visual Monotonic Stage Progression Bar */}
          {progress && progress.stages && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs overflow-hidden">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layers size={16} className="text-green-700" />
                <span>Crop Phenological Stages Progression</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {progress.stages.map((stg) => {
                  const isCompleted = stg.status === "COMPLETED";
                  const isInProgress = stg.status === "IN_PROGRESS";
                  const isDelayed = stg.status === "DELAYED";

                  return (
                    <div
                      key={stg.id}
                      className={`relative flex flex-col justify-between rounded-xl p-3 border transition-all ${
                        isCompleted
                          ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                          : isInProgress
                          ? "border-blue-500 bg-blue-50/50 text-blue-950 ring-2 ring-blue-500/20 shadow-xs"
                          : isDelayed
                          ? "border-amber-300 bg-amber-50/40 text-amber-950"
                          : "border-slate-200/80 bg-slate-50/50 text-slate-600 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-bold opacity-70">
                          <span>Stage {stg.stage_order}</span>
                          {isCompleted && <CheckCircle2 size={12} className="text-emerald-600" />}
                          {isInProgress && <Clock size={12} className="text-blue-600 animate-spin" />}
                        </div>
                        <p className="mt-1 text-xs font-bold leading-snug line-clamp-2">
                          {stg.stage_name}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/40 text-[10px]">
                        <span
                          className={`inline-block rounded-md px-1.5 py-0.5 font-bold uppercase tracking-wider text-[9px] ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : isInProgress
                              ? "bg-blue-100 text-blue-800"
                              : isDelayed
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200/60 text-slate-600"
                          }`}
                        >
                          {stg.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Live 7-Day Agro-Weather Forecast (Open-Meteo) */}
          <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50/40 to-blue-50/30 p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200/70">
              <div>
                <div className="flex items-center gap-2">
                  <CloudRain size={18} className="text-blue-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    Live 7-Day Micro-Climate Weather Forecast
                  </h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-800 uppercase tracking-wide">
                    Open-Meteo High-Resolution
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-500">
                  Real-time precipitation, temperature extremes, and wind data driving automated ICAR task replanning.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                {selectedCycleId && (
                  <button
                    type="button"
                    onClick={() => loadCycleDetails(selectedCycleId)}
                    disabled={weatherLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition-all"
                  >
                    <RefreshCw size={13} className={weatherLoading ? "animate-spin" : ""} />
                    <span>{weatherLoading ? "Refreshing..." : "Sync Weather"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Daily Cards Grid */}
            {weatherLoading && !weatherForecast ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Fetching Open-Meteo satellite & meteorological forecast...
              </div>
            ) : weatherForecast && weatherForecast.data && weatherForecast.data.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                {weatherForecast.data.slice(0, 7).map((day, idx) => {
                  const dateObj = new Date(day.forecast_date);
                  const isToday = idx === 0 || day.forecast_date === new Date().toISOString().split("T")[0];
                  const dayName = isToday
                    ? "Today"
                    : dateObj.toLocaleDateString("en-US", { weekday: "short" });
                  const dateFormatted = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const isRainy = (day.precipitation_sum_mm || 0) > 1.0;
                  const isHot = (day.temp_max_c || 0) > 34;

                  return (
                    <div
                      key={day.forecast_date || idx}
                      className={`flex flex-col justify-between rounded-xl p-3 border transition-all ${
                        isToday
                          ? "border-blue-400 bg-blue-50/70 shadow-xs ring-1 ring-blue-400/30"
                          : isRainy
                          ? "border-blue-200 bg-blue-50/30"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-black ${isToday ? "text-blue-900" : "text-slate-800"}`}>
                            {dayName}
                          </span>
                          <span className="text-[9px] font-semibold text-slate-400">
                            {dateFormatted}
                          </span>
                        </div>

                        {/* Weather Icon & Rain */}
                        <div className="mt-3 flex items-center justify-center">
                          {isRainy ? (
                            <CloudRain size={28} className="text-blue-600 animate-pulse" />
                          ) : isHot ? (
                            <Sun size={28} className="text-amber-500" />
                          ) : (
                            <Cloud size={28} className="text-slate-500" />
                          )}
                        </div>

                        <div className="mt-2 text-center">
                          <span className="text-sm font-black text-slate-900">
                            {Math.round(day.temp_max_c)}°
                          </span>
                          <span className="text-xs font-semibold text-slate-400 ml-1">
                            / {Math.round(day.temp_min_c)}°C
                          </span>
                        </div>
                      </div>

                      {/* Rain & Wind Specs */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                        <span className="flex items-center gap-0.5 font-bold">
                          <Droplets size={10} className={isRainy ? "text-blue-600" : "text-slate-400"} />
                          {day.precipitation_sum_mm || 0} mm
                        </span>
                        <span className="flex items-center gap-0.5 font-medium text-slate-500">
                          <Wind size={10} className="text-slate-400" />
                          {Math.round(day.wind_speed_max_kmh || 0)} km/h
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">
                Weather forecast currently unavailable. Showing baseline PAU climatic data.
              </div>
            )}
          </div>

          {/* 5. Smart Advisory Active Alert Banner (If Rules Fired) */}
          {ruleEvaluation && ruleEvaluation.rulesFiredCount > 0 && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0 mt-0.5 shadow-xs">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Agronomic Weather Advisory Detected ({ruleEvaluation.rulesFiredCount} Alert{ruleEvaluation.rulesFiredCount > 1 ? "s" : ""})
                    </h4>
                    <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[9px] font-black text-amber-900">
                      Open-Meteo Rules Fired
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-amber-900/90 leading-relaxed max-w-3xl">
                    Adverse meteorological events (rain, high winds, or frost) coincide with upcoming scheduled tasks. Use the <strong>"⚡ 1-Click Smart Reschedule"</strong> button below each affected task to automatically preserve input efficacy and comply with PAU/ICAR safety guidelines.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Smart Reschedule Success Notification */}
          {smartSuccessMsg && (
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 flex items-center gap-2 shadow-xs">
              <Sparkles size={16} className="text-emerald-600" />
              <span>{smartSuccessMsg}</span>
            </div>
          )}

          {/* 6. Actionable Farm Tasks Board */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar size={17} className="text-green-700" />
                  <span>Scheduled Farm Activities & Interventions</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Execute, postpone, or smart-reschedule field activities with guaranteed audit logs.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["ALL", "IRRIGATION", "NUTRIENT", "PROTECTION", "HARVEST"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFilterCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                      filterCategory === cat
                        ? "bg-green-700 text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Task Cards List */}
            <div className="mt-4 divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No tasks found in this category.
                </div>
              ) : (
                filteredTasks.map((t) => {
                  const isCompleted = t.status === "COMPLETED";
                  const isPostponed = t.status === "POSTPONED";

                  // Find daily weather for this task's target date
                  const taskDayWeather = weatherForecast?.data?.find(
                    (d) => d.forecast_date === t.target_date
                  );

                  // Calculate 48h rainfall sum starting from target_date
                  const nextDayIso = new Date(new Date(t.target_date).getTime() + 86400000)
                    .toISOString()
                    .split("T")[0];
                  const nextDayWeather = weatherForecast?.data?.find(
                    (d) => d.forecast_date === nextDayIso
                  );
                  const rain48hSum = Number(
                    ((taskDayWeather?.precipitation_sum_mm || 0) + (nextDayWeather?.precipitation_sum_mm || 0)).toFixed(1)
                  );

                  // Check if task is spray/nitrogen/nutrient sensitive
                  const isSprayOrNutrient =
                    t.category === "PROTECTION" ||
                    t.category === "NUTRIENT" ||
                    t.title.toLowerCase().includes("spray") ||
                    t.title.toLowerCase().includes("urea") ||
                    t.title.toLowerCase().includes("nitrogen") ||
                    t.title.toLowerCase().includes("fertilizer");

                  const isHighRainRisk = isSprayOrNutrient && rain48hSum >= 10.0;

                  // Check if this task triggered any backend weather rules
                  const triggeredRule = ruleEvaluation?.evaluations?.find(
                    (e) => e.taskId === t.id && e.triggered
                  );

                  const hasAdvisory = (triggeredRule || isHighRainRisk) && !isCompleted;

                  return (
                    <div
                      key={t.id}
                      className={`py-4 flex flex-col gap-3 transition-colors rounded-xl px-3 ${
                        hasAdvisory
                          ? "bg-amber-50/50 border border-amber-200/90 my-2 shadow-2xs"
                          : "hover:bg-slate-50/50"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-1 flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-700"
                                : hasAdvisory
                                ? "bg-amber-200 text-amber-900"
                                : isPostponed
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={16} />
                            ) : hasAdvisory ? (
                              <AlertTriangle size={16} />
                            ) : (
                              <Calendar size={16} />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 uppercase">
                                {t.category}
                              </span>
                              {t.priority === "CRITICAL" && (
                                <span className="rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-black text-red-700 uppercase">
                                  Critical
                                </span>
                              )}
                              {t.is_weather_sensitive && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200/60">
                                  <Wind size={10} /> Weather Sensitive
                                </span>
                              )}

                              {/* Task Day Micro-Weather Badge */}
                              {taskDayWeather && (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                                    (taskDayWeather.precipitation_sum_mm || 0) > 2.0
                                      ? "bg-blue-50 text-blue-800 border-blue-200"
                                      : "bg-slate-50 text-slate-700 border-slate-200"
                                  }`}
                                >
                                  {(taskDayWeather.precipitation_sum_mm || 0) > 2.0 ? (
                                    <CloudRain size={11} className="text-blue-600" />
                                  ) : (
                                    <Sun size={11} className="text-amber-500" />
                                  )}
                                  <span>
                                    {Math.round(taskDayWeather.temp_max_c)}°/
                                    {Math.round(taskDayWeather.temp_min_c)}°C
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Droplets size={9} /> {taskDayWeather.precipitation_sum_mm || 0}mm
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-0.5">
                                    <Wind size={9} /> {Math.round(taskDayWeather.wind_speed_max_kmh || 0)}km/h
                                  </span>
                                </span>
                              )}
                            </div>

                            <h4 className="mt-1 text-sm font-bold text-slate-900">{t.title}</h4>
                            {t.description && (
                              <p className="mt-0.5 text-xs text-slate-500 max-w-xl">{t.description}</p>
                            )}

                            <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                              <span>Window: {t.earliest_date} → {t.latest_date}</span>
                              <span className="font-bold text-slate-700">Target: {t.target_date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Execution Action Button */}
                        <div className="flex items-center gap-2 shrink-0 sm:self-center">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={14} /> Completed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setExecutingTask(t)}
                              className="inline-flex items-center gap-1 rounded-xl bg-green-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-green-800 transition-all cursor-pointer"
                            >
                              <span>Action Task</span>
                              <ChevronRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Rule Engine Advisory & 1-Click Smart Reschedule Box */}
                      {hasAdvisory && (
                        <div className="mt-2 rounded-xl border border-amber-300 bg-amber-100/60 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <AlertTriangle size={17} className="text-amber-700 shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <p className="font-extrabold text-amber-950">
                                ⚠️ High Rain Probability ({rain48hSum > 0 ? `${rain48hSum}mm` : ">15mm"} forecasted within 48h): Recommended to postpone spray by 2 days.
                              </p>
                              <p className="text-[11px] text-amber-900/85 mt-0.5">
                                {triggeredRule?.explanation ||
                                  "High precipitation within 48h causes nitrogen leaching and wash-off of chemical sprays. Shifting target date preserves efficacy."}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleSmartReschedule(
                                t.id,
                                t.target_date,
                                triggeredRule?.daysOffset || 2,
                                triggeredRule?.explanation || `Shifted 2 days due to ${rain48hSum}mm rain forecast in 48h window`,
                                triggeredRule?.ruleId
                              )
                            }
                            disabled={reschedulingTaskId === t.id}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 cursor-pointer transition-all shrink-0"
                          >
                            <Zap size={14} className={reschedulingTaskId === t.id ? "animate-spin" : ""} />
                            <span>
                              {reschedulingTaskId === t.id
                                ? "Auto-Rescheduling..."
                                : "⚡ 1-Click Auto Reschedule"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {/* 5. New Crop Plan Modal */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Create New Scientific Crop Plan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select your farm plot, crop, and sowing date to generate a complete lifecycle schedule.
            </p>

            <form onSubmit={handleGenerateCycle} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                  {formError}
                </div>
              )}

              {/* Farm Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Farm Plot Location</label>
                  {farms.length === 0 && (
                    <span className="text-[10px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      Auto-initializes on submit
                    </span>
                  )}
                </div>
                {farms.length === 0 ? (
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>🌾 Main Farm Plot (5 Acres - Default)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Ready</span>
                  </div>
                ) : (
                  <select
                    required
                    value={formFarmId}
                    onChange={(e) => setFormFarmId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 cursor-pointer"
                  >
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.areaAcres || 5} Acres)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Crop Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Crop (Catalog)</label>
                  <select
                    required
                    value={formCropCode}
                    onChange={(e) => setFormCropCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 cursor-pointer"
                  >
                    {cropCatalog.map((c) => (
                      <option key={c.crop_code} value={c.crop_code}>
                        {c.common_name} ({c.season_category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cultivar Variety</label>
                  <select
                    required
                    value={formVarietyCode}
                    onChange={(e) => setFormVarietyCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20 cursor-pointer"
                  >
                    {varieties.map((v) => (
                      <option key={v.variety_code} value={v.variety_code}>
                        {v.variety_name} ({v.typical_duration_days} days)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sowing Date & Acreage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sowing Date</label>
                  <input
                    type="date"
                    required
                    value={formSowingDate}
                    onChange={(e) => setFormSowingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Allocated Area (Acres)</label>
                  <input
                    type="number"
                    required
                    min={0.1}
                    step={0.1}
                    value={formArea}
                    onChange={(e) => setFormArea(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-900 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
                  />
                </div>
              </div>

              {/* Projected Harvest Preview Banner */}
              <div className="rounded-xl border border-green-200/80 bg-green-50/70 p-3 text-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-green-800 uppercase tracking-wider">Projected Harvest Date</span>
                  <p className="font-extrabold text-green-950 text-sm">{estimatedHarvestDate}</p>
                </div>
                <span className="rounded-md bg-green-200/80 px-2 py-1 text-[11px] font-extrabold text-green-900">
                  {typicalDuration} Days Lifecycle
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-xl bg-green-700 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-green-800 disabled:opacity-50 cursor-pointer transition-all active:scale-[0.98]"
                >
                  {formLoading ? "Generating Schedule..." : "Generate Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Task Execution Modal */}
      {executingTask && (
        <TaskExecutionModal
          task={executingTask}
          isOpen={true}
          onClose={() => setExecutingTask(null)}
          onSuccess={() => {
            if (selectedCycleId) {
              loadCycleDetails(selectedCycleId);
            }
          }}
        />
      )}

      {/* 7. ICAR Dosage Calculator Modal */}
      <DosageCalculatorModal
        isOpen={isDosageModalOpen}
        onClose={() => setIsDosageModalOpen(false)}
        farms={farms}
      />

      {/* 8. ICAR Pest & Disease Early Warning Modal */}
      <PestDiseaseAdvisorModal
        isOpen={isPestModalOpen}
        onClose={() => setIsPestModalOpen(false)}
        defaultCropCode={formCropCode?.includes("WHEAT") ? "WHEAT" : formCropCode?.includes("MUSTARD") ? "MUSTARD" : formCropCode?.includes("CHICKPEA") ? "CHICKPEA" : "WHEAT"}
      />
    </div>
  );
};

export default Crops;
