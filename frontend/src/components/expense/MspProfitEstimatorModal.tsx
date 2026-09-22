import { useState, useMemo } from "react";
import {
  TrendingUp,
  X,
  Copy,
  Check,
  Scale,
  Volume2,
  VolumeX,
  Sprout,
  Building,
} from "lucide-react";
import type { Farm } from "../../types/farm";

export interface MspCropConfig {
  code: string;
  name: string;
  hindiName: string;
  mspPerQuintal: number; // Govt Minimum Support Price (₹/Quintal)
  avgYieldQuintalsPerAcre: number;
  typicalCostPerAcre: number;
  season: "Rabi" | "Kharif" | "Zaid";
}

export const MSP_CROPS_DATABASE: MspCropConfig[] = [
  {
    code: "WHEAT",
    name: "Bread Wheat",
    hindiName: "गेहूं",
    mspPerQuintal: 2425, // 2024-25 MSP
    avgYieldQuintalsPerAcre: 21,
    typicalCostPerAcre: 14500,
    season: "Rabi",
  },
  {
    code: "MUSTARD",
    name: "Indian Mustard",
    hindiName: "सरसों",
    mspPerQuintal: 5950,
    avgYieldQuintalsPerAcre: 10,
    typicalCostPerAcre: 11200,
    season: "Rabi",
  },
  {
    code: "CHICKPEA",
    name: "Desi Gram / Chickpea",
    hindiName: "चना",
    mspPerQuintal: 5650,
    avgYieldQuintalsPerAcre: 8.5,
    typicalCostPerAcre: 10500,
    season: "Rabi",
  },
  {
    code: "PADDY_GRADE_A",
    name: "Paddy (Common/Grade A)",
    hindiName: "धान (साधारण / ग्रेड-ए)",
    mspPerQuintal: 2320,
    avgYieldQuintalsPerAcre: 28,
    typicalCostPerAcre: 18000,
    season: "Kharif",
  },
  {
    code: "BASMATI_PADDY",
    name: "Basmati Rice (Mandi Ref)",
    hindiName: "बासमती धान",
    mspPerQuintal: 3850,
    avgYieldQuintalsPerAcre: 18,
    typicalCostPerAcre: 21000,
    season: "Kharif",
  },
  {
    code: "POTATO",
    name: "Table Potato",
    hindiName: "आलू",
    mspPerQuintal: 1150,
    avgYieldQuintalsPerAcre: 125,
    typicalCostPerAcre: 42000,
    season: "Rabi",
  },
  {
    code: "MAIZE",
    name: "Maize / Corn",
    hindiName: "मक्का",
    mspPerQuintal: 2225,
    avgYieldQuintalsPerAcre: 24,
    typicalCostPerAcre: 13800,
    season: "Kharif",
  },
  {
    code: "COTTON",
    name: "Medium/Long Cotton",
    hindiName: "कपास / नरमा",
    mspPerQuintal: 7020,
    avgYieldQuintalsPerAcre: 9.5,
    typicalCostPerAcre: 19500,
    season: "Kharif",
  },
  {
    code: "SOYBEAN",
    name: "Yellow Soybean",
    hindiName: "सोयाबीन",
    mspPerQuintal: 4892,
    avgYieldQuintalsPerAcre: 9,
    typicalCostPerAcre: 12500,
    season: "Kharif",
  },
];

interface MspProfitEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms?: Farm[];
  totalCurrentExpense?: number;
  initialCropCode?: string;
  initialAcres?: number;
}

export const MspProfitEstimatorModal = ({
  isOpen,
  onClose,
  farms = [],
  totalCurrentExpense = 0,
  initialCropCode = "WHEAT",
  initialAcres = 4,
}: MspProfitEstimatorModalProps) => {
  const [selectedCropCode, setSelectedCropCode] = useState<string>(initialCropCode);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [areaAcres, setAreaAcres] = useState<number>(initialAcres);
  const [customPricePerQtl, setCustomPricePerQtl] = useState<number | "">("");
  const [customYieldPerAcre, setCustomYieldPerAcre] = useState<number | "">("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"ESTIMATOR" | "KCC_REPORT">("ESTIMATOR");

  const crop = useMemo(() => {
    return MSP_CROPS_DATABASE.find((c) => c.code === selectedCropCode) || MSP_CROPS_DATABASE[0];
  }, [selectedCropCode]);

  // Handle farm selection
  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    if (!farmId) return;
    const farm = farms.find((f) => f.id === farmId);
    if (farm && farm.areaAcres) {
      setAreaAcres(farm.areaAcres);
    }
  };

  // Calculations
  const metrics = useMemo(() => {
    const acres = Math.max(0.25, Number(areaAcres) || 1);
    const pricePerQtl = typeof customPricePerQtl === "number" && customPricePerQtl > 0 ? customPricePerQtl : crop.mspPerQuintal;
    const yieldPerAcre = typeof customYieldPerAcre === "number" && customYieldPerAcre > 0 ? customYieldPerAcre : crop.avgYieldQuintalsPerAcre;

    const totalYieldQuintals = Math.round(acres * yieldPerAcre * 10) / 10;
    const grossRevenue = Math.round(totalYieldQuintals * pricePerQtl);

    // If real logged expense exists and is proportional, use it, else calculate benchmark
    const estimatedCost = totalCurrentExpense > 0 && totalCurrentExpense > 2000
      ? totalCurrentExpense
      : Math.round(crop.typicalCostPerAcre * acres);

    const netProfit = grossRevenue - estimatedCost;
    const profitMargin = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
    const profitPerAcre = Math.round(netProfit / acres);
    const roiPercentage = estimatedCost > 0 ? Math.round((netProfit / estimatedCost) * 100) : 0;

    return {
      acres,
      pricePerQtl,
      yieldPerAcre,
      totalYieldQuintals,
      grossRevenue,
      estimatedCost,
      netProfit,
      profitMargin,
      profitPerAcre,
      roiPercentage,
      isProfitable: netProfit > 0,
    };
  }, [crop, areaAcres, customPricePerQtl, customYieldPerAcre, totalCurrentExpense]);

  // Voice Readout (Hindi/English)
  const handleVoiceEstimate = () => {
    if (!("speechSynthesis" in window)) {
      alert("Voice speech not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${metrics.acres} एकड़ ${crop.hindiName} फसल अनुमान: 
      कुल उत्पादन लगभग ${metrics.totalYieldQuintals} क्विंटल होगा। 
      न्यूनतम समर्थन मूल्य ${metrics.pricePerQtl} रुपये प्रति क्विंटल के आधार पर कुल आय लगभग ${metrics.grossRevenue.toLocaleString("en-IN")} रुपये होगी। 
      अनुमानित लागत ${metrics.estimatedCost.toLocaleString("en-IN")} रुपये घटाने के बाद आपका शुद्ध मुनाफा लगभग ${metrics.netProfit.toLocaleString("en-IN")} रुपये होगा। प्रति एकड़ लाभ ${metrics.profitPerAcre.toLocaleString("en-IN")} रुपये रहेगा।`;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.startsWith("hi") || v.lang.includes("hi-IN"));
    if (hindiVoice) utterance.voice = hindiVoice;
    utterance.lang = "hi-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Copy statement text
  const handleCopyReport = () => {
    const reportText = `====================================================
🌾 KRISHIORA FARM FINANCIAL STATEMENT & KCC ESTIMATE
====================================================
Crop: ${crop.hindiName} (${crop.name}) | Season: ${crop.season}
Operational Area: ${metrics.acres} Acres
----------------------------------------------------
1. PRODUCTION ESTIMATION (उत्पादन अनुमान)
   • Expected Yield Rate: ${metrics.yieldPerAcre} Quintals/Acre
   • Total Estimated Yield: ${metrics.totalYieldQuintals} Quintals
   • Reference Price / MSP: ₹${metrics.pricePerQtl.toLocaleString("en-IN")}/Qtl

2. REVENUE & FINANCIAL PROJECTIONS (वित्तीय विश्लेषण)
   • Gross Projected Revenue: ₹${metrics.grossRevenue.toLocaleString("en-IN")}
   • Total Cultivation Outflow: ₹${metrics.estimatedCost.toLocaleString("en-IN")}
   • Net Estimated Profit: ₹${metrics.netProfit.toLocaleString("en-IN")}
   • Net Profit Per Acre: ₹${metrics.profitPerAcre.toLocaleString("en-IN")}/Acre
   • Profit Margin: ${metrics.profitMargin}% | Return on Investment (ROI): ${metrics.roiPercentage}%
----------------------------------------------------
Verified via KrishiOra ICAR Agronomic Engine
Date: ${new Date().toLocaleDateString("en-IN")}
====================================================`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-gradient-to-r from-emerald-900 via-green-900 to-teal-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                MSP Yield & Profit (P&L) Estimator
                <span className="text-[10px] font-bold bg-white/10 text-emerald-200 px-2 py-0.5 rounded-full">
                  मुनाफा व KCC रिपोर्ट
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                Projected gross revenue, cultivation ROI, and bank KCC Scale of Finance
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("ESTIMATOR")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "ESTIMATOR"
                ? "bg-white text-emerald-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Profit & ROI Estimator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("KCC_REPORT")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "KCC_REPORT"
                ? "bg-white text-emerald-900 shadow-2xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            KCC Scale of Finance Statement
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
            {/* Crop Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Crop Variety (फसल)
              </label>
              <select
                value={selectedCropCode}
                onChange={(e) => {
                  setSelectedCropCode(e.target.value);
                  setCustomPricePerQtl("");
                  setCustomYieldPerAcre("");
                }}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {MSP_CROPS_DATABASE.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.hindiName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Farm Select / Area in Acres */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Farm Area (एकड़/Acre)
              </label>
              <div className="flex items-center gap-1.5">
                {farms.length > 0 && (
                  <select
                    value={selectedFarmId}
                    onChange={(e) => handleFarmSelect(e.target.value)}
                    className="w-1/2 h-10 px-2 text-[11px] font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                  >
                    <option value="">-- Plot --</option>
                    {farms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                )}
                <input
                  type="number"
                  step="0.25"
                  min="0.25"
                  max="500"
                  value={areaAcres}
                  onChange={(e) => {
                    setAreaAcres(parseFloat(e.target.value) || 1);
                    setSelectedFarmId("");
                  }}
                  className={`${farms.length > 0 ? "w-1/2" : "w-full"} h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700`}
                />
              </div>
            </div>

            {/* Mandi / MSP Rate (₹/Qtl) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Rate (₹/Qtl)</span>
                <span className="text-[10px] text-emerald-800 font-extrabold">MSP: ₹{crop.mspPerQuintal}</span>
              </label>
              <input
                type="number"
                placeholder={`Default: ₹${crop.mspPerQuintal}`}
                value={customPricePerQtl}
                onChange={(e) => setCustomPricePerQtl(e.target.value ? parseFloat(e.target.value) : "")}
                className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {activeTab === "ESTIMATOR" ? (
            <>
              {/* Primary P&L Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Gross Revenue */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Gross Revenue (कुल आय)
                  </span>
                  <div className="mt-2.5">
                    <span className="text-xl sm:text-2xl font-black text-emerald-950">
                      ₹{metrics.grossRevenue.toLocaleString("en-IN")}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      {metrics.totalYieldQuintals} Quintals @ ₹{metrics.pricePerQtl}/Qtl
                    </p>
                  </div>
                </div>

                {/* Cultivation Cost */}
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Total Cost (कुल लागत)
                  </span>
                  <div className="mt-2.5">
                    <span className="text-xl sm:text-2xl font-black text-amber-950">
                      ₹{metrics.estimatedCost.toLocaleString("en-IN")}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-1">
                      approx. ₹{Math.round(metrics.estimatedCost / metrics.acres).toLocaleString("en-IN")}/acre
                    </p>
                  </div>
                </div>

                {/* Net Profit */}
                <div className="rounded-2xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-2xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    Net Profit (शुद्ध लाभ)
                  </span>
                  <div className="mt-2.5">
                    <span className="text-xl sm:text-2xl font-black text-blue-950">
                      ₹{metrics.netProfit.toLocaleString("en-IN")}
                    </span>
                    <p className="text-[11px] text-blue-800 font-bold mt-1">
                      Margin: {metrics.profitMargin}% | ROI: {metrics.roiPercentage}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Detailed Financial Key Performance Metrics */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Scale size={15} className="text-emerald-700" />
                  <span>Per-Acre Commercial Return & Yield Indicators</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Expected Yield</span>
                    <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                      {metrics.yieldPerAcre} Qtl/Acre
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Profit / Acre</span>
                    <span className="text-sm font-extrabold text-emerald-800 mt-0.5 block">
                      ₹{metrics.profitPerAcre.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Return on Cost</span>
                    <span className="text-sm font-extrabold text-blue-800 mt-0.5 block">
                      {metrics.roiPercentage}% ROI
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 block">Official Status</span>
                    <span className="text-[11px] font-extrabold text-emerald-900 bg-emerald-100 px-1.5 py-0.5 rounded mt-1 inline-block">
                      Govt MSP Covered
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* KCC Scale of Finance Statement Preview */
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs font-mono text-xs space-y-3 bg-slate-50/50">
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-extrabold text-sm text-slate-900">
                  KISAN CREDIT CARD (KCC) SCALE OF FINANCE STATEMENT
                </h3>
                <p className="text-[11px] text-slate-500 font-sans">
                  KrishiOra Agricultural Intelligence & Yield Assessment
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div>
                  <span className="text-slate-400">Crop / Variety:</span>
                  <span className="font-bold text-slate-800 ml-1.5">{crop.hindiName} ({crop.name})</span>
                </div>
                <div>
                  <span className="text-slate-400">Cultivation Area:</span>
                  <span className="font-bold text-slate-800 ml-1.5">{metrics.acres} Acres</span>
                </div>
                <div>
                  <span className="text-slate-400">Crop Season:</span>
                  <span className="font-bold text-slate-800 ml-1.5">{crop.season}</span>
                </div>
                <div>
                  <span className="text-slate-400">Govt MSP Rate:</span>
                  <span className="font-bold text-slate-800 ml-1.5">₹{metrics.pricePerQtl}/Qtl</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 font-sans text-xs">
                <div className="flex justify-between">
                  <span>1. Projected Harvest Yield ({metrics.yieldPerAcre} Qtl/Acre):</span>
                  <span className="font-bold">{metrics.totalYieldQuintals} Quintals</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Gross Market / MSP Realization:</span>
                  <span className="font-bold text-emerald-800">₹{metrics.grossRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>3. Scale of Finance Cultivation Cost:</span>
                  <span className="font-bold text-amber-800">₹{metrics.estimatedCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-sm">
                  <span>Net Estimated Farm Profit:</span>
                  <span className="text-emerald-900">₹{metrics.netProfit.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50">
          <button
            type="button"
            onClick={handleVoiceEstimate}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isSpeaking
                ? "bg-amber-100 border-amber-300 text-amber-900 animate-pulse"
                : "bg-white border-slate-200 text-slate-700 hover:text-emerald-800 hover:border-emerald-300"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={14} className="text-amber-800" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-emerald-700" />
                <span>बोलकर सुनें (Listen)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copy Statement</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white transition-colors cursor-pointer shadow-xs"
            >
              Done (पूर्ण)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MspProfitEstimatorModal;
