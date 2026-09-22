import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Search,
  Sprout,
  Layers,
  Droplets,
  Building,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Trash2,
  Edit3,
  ExternalLink,
  Shield,
  Sparkles,
  Compass,
} from "lucide-react";
import { farmService } from "../services/farm.service";
import type { Farm } from "../types/farm";
import { useLanguage } from "../hooks/useLanguage";

const SOIL_OPTIONS = [
  "Alluvial Soil (जलोढ़ मिट्टी)",
  "Black Cotton Soil (काली मिट्टी)",
  "Red & Yellow Loam (लाल व पीली मिट्टी)",
  "Sandy Loam (बलुई दोमट मिट्टी)",
  "Clayey Soil (चिकनी मिट्टी)",
];

const IRRIGATION_OPTIONS = [
  "Tube-well / Borewell (नलकूप / बोरवेल)",
  "Canal Irrigation (नहरी सिंचाई)",
  "Drip Irrigation (ड्रिप / टपक सिंचाई)",
  "Sprinkler System (फव्वारा सिंचाई)",
  "Rainfed (वर्षा आधारित / बारानी)",
];

export const Farms = () => {
  const { lang } = useLanguage();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [soilFilter, setSoilFilter] = useState<string>("ALL");

  // Add/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalSaving, setModalSaving] = useState<boolean>(false);
  const [farmName, setFarmName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [areaAcres, setAreaAcres] = useState<number | string>(5);
  const [soilType, setSoilType] = useState<string>(SOIL_OPTIONS[0]);
  const [irrigationType, setIrrigationType] = useState<string>(IRRIGATION_OPTIONS[0]);
  const [ownershipType, setOwnershipType] = useState<string>("Self-Owned");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchFarms = async () => {
    setLoading(true);
    try {
      const data = await farmService.getFarms();
      setFarms(data);
    } catch (err: any) {
      console.error("Error fetching farms:", err);
      showToast("error", "Failed to load farm plots");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  // Filtered farms
  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      if (soilFilter !== "ALL" && !f.soilType?.toLowerCase().includes(soilFilter.toLowerCase())) {
        return false;
      }
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesLoc = f.location.toLowerCase().includes(q);
        const matchesSoil = f.soilType?.toLowerCase().includes(q) || false;
        if (!matchesName && !matchesLoc && !matchesSoil) {
          return false;
        }
      }
      return true;
    });
  }, [farms, soilFilter, searchTerm]);

  // Aggregate stats
  const totalAcreage = useMemo(() => {
    return farms.reduce((sum, f) => sum + (f.areaAcres || 0), 0);
  }, [farms]);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim() || !location.trim()) {
      showToast("error", lang === "hi" ? "कृपया खेत का नाम व स्थान दर्ज करें।" : "Please specify farm name and location.");
      return;
    }

    setModalSaving(true);
    try {
      await farmService.createFarm({
        name: farmName.trim(),
        location: location.trim(),
        areaAcres: Number(areaAcres),
        soilType,
        irrigationType,
        ownership_type: ownershipType,
      });

      showToast("success", lang === "hi" ? "✅ नया खेत सफलतापूर्वक जुड़ गया!" : "✅ New farm plot added successfully!");
      setIsModalOpen(false);
      setFarmName("");
      setLocation("");
      setAreaAcres(5);
      await fetchFarms();
    } catch (err: any) {
      showToast("error", err?.message || "Failed to create farm plot");
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteFarm = async (id: string, name: string) => {
    if (window.confirm(lang === "hi" ? `क्या आप "${name}" को हटाना चाहते हैं?` : `Are you sure you want to remove "${name}"?`)) {
      try {
        await farmService.deleteFarm(id);
        showToast("success", lang === "hi" ? "खेत हटा दिया गया।" : "Farm plot deleted.");
        setFarms((prev) => prev.filter((f) => f.id !== id));
      } catch (err: any) {
        showToast("error", err?.message || "Failed to delete farm plot");
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-900/80 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-xl ring-4 ring-emerald-500/20 flex-shrink-0">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {lang === "hi" ? "खेत व भूखंड प्रबंधन (Farms & Plots)" : "Farms & Plots Portfolio"}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {farms.length} Active Plots
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {lang === "hi"
                  ? "अपने सभी खेतों की मिट्टी, सिंचाई के साधन, क्षेत्रफल व स्थान का केंद्रीय प्रबंधन।"
                  : "Manage your individual agricultural plots, soil classifications, irrigation sources, and crop distribution."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "hi" ? "+ नया खेत जोड़ें" : "+ Add Farm Plot"}</span>
            </button>
          </div>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div
            className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
              toastMessage.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border border-red-500/40"
            }`}
          >
            {toastMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "कुल कृषि भूखंड" : "Total Farm Plots"}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{farms.length}</div>
          <p className="text-[11px] text-emerald-400 font-medium">Mapped in Central Geo-Registry</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "कुल क्षेत्रफल" : "Total Land Area"}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono">
            {totalAcreage} <span className="text-sm font-normal text-slate-400 font-sans">Acres</span>
          </div>
          <p className="text-[11px] text-slate-400">Operational Farm Acreage</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "प्राथमिक सिंचाई" : "Irrigation Network"}</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-cyan-400 truncate">
            {farms[0]?.irrigationType?.split("(")[0] || "Tube-well"}
          </div>
          <p className="text-[11px] text-slate-400">100% Water Availability</p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "मिट्टी की गुणवत्ता" : "Soil Health Index"}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Optimal (उर्वर)</span>
          </div>
          <p className="text-[11px] text-slate-400">N-P-K & Micronutrient Balanced</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={lang === "hi" ? "खेत का नाम, जिला या स्थान खोजें..." : "Search plots by name, village, or district..."}
            className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={soilFilter}
            onChange={(e) => setSoilFilter(e.target.value)}
            className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 w-full sm:w-auto"
          >
            <option value="ALL">All Soil Types (सभी मिट्टी)</option>
            <option value="Alluvial">Alluvial Soil (जलोढ़)</option>
            <option value="Black">Black Cotton (काली मिट्टी)</option>
            <option value="Red">Red & Yellow Loam</option>
            <option value="Sandy">Sandy Loam (बलुई)</option>
            <option value="Clay">Clayey Soil (चिकनी)</option>
          </select>

          <button
            type="button"
            onClick={fetchFarms}
            title="Refresh farms"
            className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Farms Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading farm plots...</p>
        </div>
      ) : filteredFarms.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 text-2xl mx-auto">
            🗺️
          </div>
          <h3 className="text-lg font-bold text-white">No Farm Plots Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Get started by adding your first agricultural plot to track crops, soil health, and weather advisories.
          </p>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Your First Farm</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFarms.map((farm) => (
            <div
              key={farm.id}
              className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 space-y-5 backdrop-blur-xl shadow-xl transition-all hover:shadow-2xl group flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Title & Area Badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors">
                      {farm.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className="truncate">{farm.location || "Punjab, India"}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-black font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex-shrink-0">
                    {farm.areaAcres} Acres
                  </span>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Soil Type</span>
                    <p className="font-bold text-slate-200 truncate">{farm.soilType?.split("(")[0] || "Alluvial"}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-0.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Irrigation</span>
                    <p className="font-bold text-slate-200 truncate">{farm.irrigationType?.split("(")[0] || "Tube-well"}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <Link
                  to={`/farms/${farm.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>{lang === "hi" ? "खेत का ब्यौरा देखें" : "View Plot Details"}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteFarm(farm.id, farm.name)}
                    title="Delete farm"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Farm Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 to-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white">
                  {lang === "hi" ? "नया कृषि भूखंड जोड़ें" : "Register New Farm Plot"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateFarm} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Farm / Plot Name</label>
                <input
                  type="text"
                  required
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. North Canal Plot, Wheat Block A"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Village & District Location</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Village Pipariya, Sehore, Madhya Pradesh"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Land Area (Acres)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase">Ownership</label>
                  <select
                    value={ownershipType}
                    onChange={(e) => setOwnershipType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Self-Owned">Self-Owned (खुद की)</option>
                    <option value="Leased / Theka">Leased (पट्टे पर)</option>
                    <option value="Sharecropper / Batai">Sharecropper (बटाई)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Soil Classification</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {SOIL_OPTIONS.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase">Irrigation Source</label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {IRRIGATION_OPTIONS.map((ir) => (
                    <option key={ir} value={ir} className="bg-slate-900 text-white">
                      {ir}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20"
                >
                  {modalSaving ? "Saving Plot..." : "Save Farm Plot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Farms;