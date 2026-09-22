import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  ArrowLeft,
  Sprout,
  Layers,
  Droplets,
  Receipt,
  Calendar,
  CloudSun,
  Shield,
  RefreshCw,
  Plus,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { farmService } from "../services/farm.service";
import type { Farm } from "../types/farm";
import { useLanguage } from "../hooks/useLanguage";

export const FarmDetails = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFarm = async () => {
      if (!farmId) return;
      setLoading(true);
      try {
        const data = await farmService.getFarmById(farmId);
        setFarm(data);
      } catch (err: any) {
        console.error("Error fetching farm details:", err);
        setError("Farm plot not found");
      } finally {
        setLoading(false);
      }
    };

    fetchFarm();
  }, [farmId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading farm plot details...</p>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Farm Plot Not Found</h2>
        <p className="text-slate-400 text-sm">The requested agricultural plot could not be loaded.</p>
        <Link
          to="/farms"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Farms</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/farms"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === "hi" ? "सभी खेत (All Farms)" : "Back to Farm Plots"}</span>
        </Link>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ID: {farm.id.slice(0, 8)}...
        </span>
      </div>

      {/* Main Farm Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-900/80 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-xl ring-4 ring-emerald-500/20 flex-shrink-0">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {farm.name}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {farm.areaAcres} Acres
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{farm.location}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/crops"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <Sprout className="w-4 h-4" />
              <span>{lang === "hi" ? "+ नई फसल प्लान करें" : "+ Plan New Crop"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Attributes & Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Soil Classification</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-white">{farm.soilType || "Alluvial Soil"}</p>
          <p className="text-[11px] text-slate-400">Optimal N-P-K nutrient retention</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Irrigation Source</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-cyan-400">{farm.irrigationType || "Tube-well"}</p>
          <p className="text-[11px] text-slate-400">Submersible pump water network</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase">
            <span>Status</span>
            <Shield className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400">Active & Sown</p>
          <p className="text-[11px] text-slate-400">Synchronized with weather rules</p>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <span>Active Crop Cycles on this Plot</span>
          </h3>
          <p className="text-xs text-slate-400">
            View growth stage progression, calendar tasks, and weather advisories for this plot.
          </p>
          <Link
            to="/crops"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-emerald-400 transition-all"
          >
            <span>Open Crop Lifecycle Planner</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-400" />
            <span>Input Expenses & Ledger</span>
          </h3>
          <p className="text-xs text-slate-400">
            Log fertilizer purchases, diesel refills, and labour wages associated with this farm plot.
          </p>
          <Link
            to="/expenses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-400 transition-all"
          >
            <span>Open Expense Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FarmDetails;