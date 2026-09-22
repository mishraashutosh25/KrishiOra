import { useState, useMemo } from "react";
import {
  Calculator,
  X,
  Sprout,
  Layers,
  Sparkles,
  Volume2,
  VolumeX,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Info,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import type { Farm } from "../../types/farm";

export interface CropDosageConfig {
  code: string;
  name: string;
  hindiName: string;
  season: "Rabi" | "Kharif" | "Zaid" | "Year-round";
  npkKgPerAcre: { n: number; p: number; k: number };
  seedRatePerAcreKg: { min: number; max: number; standard: number };
  seedTreatment: string;
  basalDose: {
    dapBagsPerAcre: number;
    mopBagsPerAcre: number;
    zincKgPerAcre?: number;
    sulfurKgPerAcre?: number;
    notes: string;
  };
  topDressing: {
    split1Stage: string;
    split1UreaBagsPerAcre: number;
    split2Stage?: string;
    split2UreaBagsPerAcre?: number;
    notes: string;
  };
}

export const ICAR_CROPS_CONFIG: CropDosageConfig[] = [
  {
    code: "WHEAT",
    name: "Bread Wheat",
    hindiName: "गेहूं",
    season: "Rabi",
    npkKgPerAcre: { n: 48, p: 24, k: 16 },
    seedRatePerAcreKg: { min: 38, max: 45, standard: 40 },
    seedTreatment: "Thiram / Carbendazim @ 2.5 g/kg seed OR Trichoderma viride @ 5 g/kg seed",
    basalDose: {
      dapBagsPerAcre: 1.0, // 50kg DAP gives 9kg N + 23kg P2O5
      mopBagsPerAcre: 0.5, // 25kg MOP gives 15kg K2O
      zincKgPerAcre: 10,
      notes: "Apply 100% of DAP, MOP, and Zinc Sulfate (21%) at the time of final field preparation/sowing.",
    },
    topDressing: {
      split1Stage: "1st Irrigation (CRI Stage - 21 Days)",
      split1UreaBagsPerAcre: 1.0,
      split2Stage: "2nd Irrigation (Tillering - 45 Days)",
      split2UreaBagsPerAcre: 1.0,
      notes: "Apply Urea only when soil has optimum moisture. Spray Nano Urea (4ml/L) at flag leaf stage for grain filling.",
    },
  },
  {
    code: "MUSTARD",
    name: "Indian Mustard",
    hindiName: "सरसों",
    season: "Rabi",
    npkKgPerAcre: { n: 32, p: 16, k: 16 },
    seedRatePerAcreKg: { min: 1.5, max: 2.0, standard: 1.8 },
    seedTreatment: "Apron 35SD @ 6 g/kg seed + Azotobacter bio-fertilizer",
    basalDose: {
      dapBagsPerAcre: 0.7,
      mopBagsPerAcre: 0.4,
      sulfurKgPerAcre: 10,
      notes: "Sulfur (Bentonite 90%) is critical for oil synthesis. Apply full P, K & Sulfur as basal.",
    },
    topDressing: {
      split1Stage: "1st Irrigation / Pre-Flowering (30-35 Days)",
      split1UreaBagsPerAcre: 0.8,
      notes: "Top dress Urea before flowering. Avoid excessive nitrogen to prevent lodging and aphid infestation.",
    },
  },
  {
    code: "CHICKPEA",
    name: "Desi Chickpea / Gram",
    hindiName: "चना",
    season: "Rabi",
    npkKgPerAcre: { n: 8, p: 20, k: 8 },
    seedRatePerAcreKg: { min: 30, max: 35, standard: 32 },
    seedTreatment: "Rhizobium culture @ 250 g/10 kg seed + Trichoderma @ 4 g/kg seed",
    basalDose: {
      dapBagsPerAcre: 0.9,
      mopBagsPerAcre: 0.2,
      notes: "As a legume, chickpea fixes atmospheric nitrogen. Do not over-apply Urea.",
    },
    topDressing: {
      split1Stage: "Branching / Pre-Flowering",
      split1UreaBagsPerAcre: 0,
      notes: "No soil Urea required. Spray 2% Urea or 19:19:19 water-soluble NPK before flowering.",
    },
  },
  {
    code: "PADDY",
    name: "Paddy / Basmati Rice",
    hindiName: "धान / चावल",
    season: "Kharif",
    npkKgPerAcre: { n: 48, p: 24, k: 20 },
    seedRatePerAcreKg: { min: 8, max: 12, standard: 10 },
    seedTreatment: "Carbendazim @ 2 g/kg seed OR Streptocycline @ 1 g/10 kg seed for bacterial blight",
    basalDose: {
      dapBagsPerAcre: 1.0,
      mopBagsPerAcre: 0.6,
      zincKgPerAcre: 10,
      notes: "Incorporate DAP & MOP at puddling. Zinc deficiency causes Khaira disease.",
    },
    topDressing: {
      split1Stage: "Tillering Stage (20-25 Days after transplanting)",
      split1UreaBagsPerAcre: 1.0,
      split2Stage: "Panicle Initiation (40-45 Days)",
      split2UreaBagsPerAcre: 1.0,
      notes: "Apply Neem Coated Urea in standing water (shallow depth) for maximum efficiency.",
    },
  },
  {
    code: "POTATO",
    name: "Potato",
    hindiName: "आलू",
    season: "Rabi",
    npkKgPerAcre: { n: 60, p: 40, k: 50 },
    seedRatePerAcreKg: { min: 1200, max: 1500, standard: 1400 },
    seedTreatment: "Mancozeb @ 3 g/L water tuber dip for 10 minutes",
    basalDose: {
      dapBagsPerAcre: 1.8,
      mopBagsPerAcre: 1.6,
      notes: "Potato is a heavy feeder of Potassium (MOP) for tuber sizing.",
    },
    topDressing: {
      split1Stage: "Earthing-up (30-35 Days)",
      split1UreaBagsPerAcre: 1.5,
      notes: "Top dress Urea before earthing up along with light irrigation.",
    },
  },
  {
    code: "MAIZE",
    name: "Maize / Corn",
    hindiName: "मक्का",
    season: "Kharif",
    npkKgPerAcre: { n: 48, p: 24, k: 16 },
    seedRatePerAcreKg: { min: 7.5, max: 8.5, standard: 8.0 },
    seedTreatment: "Imidacloprid 600FS @ 5 ml/kg seed + Thiram @ 2 g/kg seed",
    basalDose: {
      dapBagsPerAcre: 1.0,
      mopBagsPerAcre: 0.5,
      zincKgPerAcre: 10,
      notes: "Apply full Phosphorus, Potassium and 1/3 Nitrogen at sowing time.",
    },
    topDressing: {
      split1Stage: "Knee-high Stage (30 Days)",
      split1UreaBagsPerAcre: 1.0,
      split2Stage: "Tasseling Stage (55 Days)",
      split2UreaBagsPerAcre: 1.0,
      notes: "Apply Urea 5-8 cm away from plant rows to avoid root burn.",
    },
  },
];

// Govt Subsidized MRP Reference (Per 50kg Bag / kg)
const FERTILIZER_PRICES = {
  dapBag: 1350, // ₹1,350 per 50kg bag
  ureaBag: 267, // ₹267 per 45kg bag
  mopBag: 1700, // ₹1,700 per 50kg bag
  zincPerKg: 65, // ₹65 per kg Zinc Sulfate 21%
  sulfurPerKg: 50, // ₹50 per kg
};

interface DosageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  farms?: Farm[];
  initialCropCode?: string;
  initialAcres?: number;
}

export const DosageCalculatorModal = ({
  isOpen,
  onClose,
  farms = [],
  initialCropCode = "WHEAT",
  initialAcres = 4,
}: DosageCalculatorModalProps) => {
  const [selectedCropCode, setSelectedCropCode] = useState<string>(initialCropCode);
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [areaAcres, setAreaAcres] = useState<number>(initialAcres);
  const [soilNutrientStatus, setSoilNutrientStatus] = useState<"NORMAL" | "LOW_P" | "HIGH_N">("NORMAL");
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-fill area if farm is selected
  const handleFarmSelect = (farmId: string) => {
    setSelectedFarmId(farmId);
    if (!farmId) return;
    const farm = farms.find((f) => f.id === farmId);
    if (farm && farm.areaAcres) {
      setAreaAcres(farm.areaAcres);
    }
  };

  const cropConfig = useMemo(() => {
    return ICAR_CROPS_CONFIG.find((c) => c.code === selectedCropCode) || ICAR_CROPS_CONFIG[0];
  }, [selectedCropCode]);

  // Dynamic Dosage Calculations
  const calculations = useMemo(() => {
    const acres = Math.max(0.25, Number(areaAcres) || 1);

    // Soil modifier multipliers
    let pMultiplier = 1.0;
    let nMultiplier = 1.0;
    if (soilNutrientStatus === "LOW_P") pMultiplier = 1.25;
    if (soilNutrientStatus === "HIGH_N") nMultiplier = 0.85;

    // Basal Bags
    const totalDapBags = Math.round(cropConfig.basalDose.dapBagsPerAcre * acres * pMultiplier * 10) / 10;
    const totalMopBags = Math.round(cropConfig.basalDose.mopBagsPerAcre * acres * 10) / 10;
    const totalZincKg = cropConfig.basalDose.zincKgPerAcre ? Math.round(cropConfig.basalDose.zincKgPerAcre * acres) : 0;
    const totalSulfurKg = cropConfig.basalDose.sulfurKgPerAcre ? Math.round(cropConfig.basalDose.sulfurKgPerAcre * acres) : 0;

    // Top Dressing Urea Bags
    const split1UreaBags = Math.round(cropConfig.topDressing.split1UreaBagsPerAcre * acres * nMultiplier * 10) / 10;
    const split2UreaBags = cropConfig.topDressing.split2UreaBagsPerAcre
      ? Math.round(cropConfig.topDressing.split2UreaBagsPerAcre * acres * nMultiplier * 10) / 10
      : 0;
    const totalUreaBags = Math.round((split1UreaBags + split2UreaBags) * 10) / 10;

    // Seed Quantity
    const totalSeedKg = Math.round(cropConfig.seedRatePerAcreKg.standard * acres);

    // Cost Breakdown
    const dapCost = totalDapBags * FERTILIZER_PRICES.dapBag;
    const mopCost = totalMopBags * FERTILIZER_PRICES.mopBag;
    const ureaCost = totalUreaBags * FERTILIZER_PRICES.ureaBag;
    const zincCost = totalZincKg * FERTILIZER_PRICES.zincPerKg;
    const sulfurCost = totalSulfurKg * FERTILIZER_PRICES.sulfurPerKg;
    const totalFertilizerCost = Math.round(dapCost + mopCost + ureaCost + zincCost + sulfurCost);

    return {
      acres,
      totalDapBags,
      totalMopBags,
      totalZincKg,
      totalSulfurKg,
      split1UreaBags,
      split2UreaBags,
      totalUreaBags,
      totalSeedKg,
      totalFertilizerCost,
      costPerAcre: Math.round(totalFertilizerCost / acres),
    };
  }, [cropConfig, areaAcres, soilNutrientStatus]);

  // Voice Readout (Hindi/English)
  const handleVoiceReadout = () => {
    if (!("speechSynthesis" in window)) {
      alert("Voice synthesis not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = `${calculations.acres} एकड़ ${cropConfig.hindiName} के लिए आईसीएआर सिफारिश: 
      बुवाई के समय ${calculations.totalDapBags} बोरी डीएपी और ${calculations.totalMopBags} बोरी पोटाश डालें। 
      पहले और दूसरे पानी पर कुल ${calculations.totalUreaBags} बोरी यूरिया डालें। 
      कुल बीज ${calculations.totalSeedKg} किलोग्राम लगेगा। अनुमानित खाद लागत लगभग ${calculations.totalFertilizerCost} रुपये है।`;

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

  // Copy prescription text
  const handleCopy = () => {
    const summaryText = `🌾 KrishiOra ICAR Prescription (${cropConfig.hindiName} / ${cropConfig.name})
Plot Area: ${calculations.acres} Acres
----------------------------------------
1. Basal (बुवाई के समय):
   • DAP: ${calculations.totalDapBags} Bags (50kg)
   • MOP Potash: ${calculations.totalMopBags} Bags
   ${calculations.totalZincKg ? `• Zinc Sulfate: ${calculations.totalZincKg} kg` : ""}
   ${calculations.totalSulfurKg ? `• Sulfur 90%: ${calculations.totalSulfurKg} kg` : ""}

2. Top Dressing (यूरिया छिड़काव):
   • 1st Irrigation: ${calculations.split1UreaBags} Bags Urea
   ${calculations.split2UreaBags ? `• 2nd Irrigation: ${calculations.split2UreaBags} Bags Urea` : ""}
   • Total Urea: ${calculations.totalUreaBags} Bags

3. Seed Requirement (बीज की मात्रा):
   • Total Certified Seed: ${calculations.totalSeedKg} kg
   • Treatment: ${cropConfig.seedTreatment}

Estimated Fertilizer Expense: ₹${calculations.totalFertilizerCost.toLocaleString("en-IN")}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-gradient-to-r from-emerald-800 to-green-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
              <Calculator size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold flex items-center gap-1.5">
                ICAR Dosage Calculator
                <span className="text-[11px] font-medium text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
                  खाद व बीज कैलकुलेटर
                </span>
              </h2>
              <p className="text-[11px] text-emerald-100">
                Scientifically calculated NPK & seed rates based on ICAR package of practices
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Selector Bar (Crop, Farm, Acres) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
            {/* Crop Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Select Crop (फसल)
              </label>
              <select
                value={selectedCropCode}
                onChange={(e) => setSelectedCropCode(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {ICAR_CROPS_CONFIG.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.hindiName} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Farm Select (Optional Auto-fill) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Linked Plot (खेत चुनें)
              </label>
              <select
                value={selectedFarmId}
                onChange={(e) => handleFarmSelect(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                <option value="">-- Custom Acreage --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.areaAcres || 5} Acres)
                  </option>
                ))}
              </select>
            </div>

            {/* Area in Acres */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Area in Acres (रकबा/एकड़)
              </label>
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
                className="w-full h-10 px-3 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* 2. Primary Dosage Results Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Card 1: Basal Application (Sowing Time) */}
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Basal (बुवाई पर)
                </span>
                <Sparkles size={14} className="text-emerald-700" />
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between font-bold">
                  <span>DAP (50kg Bag):</span>
                  <span className="text-sm font-extrabold text-emerald-900">
                    {calculations.totalDapBags} Bags
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>MOP Potash:</span>
                  <span className="font-bold text-slate-900">
                    {calculations.totalMopBags} Bags
                  </span>
                </div>
                {calculations.totalZincKg > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Zinc Sulfate 21%:</span>
                    <span className="font-bold">{calculations.totalZincKg} kg</span>
                  </div>
                )}
                {calculations.totalSulfurKg > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Sulfur (90%):</span>
                    <span className="font-bold">{calculations.totalSulfurKg} kg</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Top Dressing (Irrigation Stages) */}
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                  Top Dressing (यूरिया)
                </span>
                <Layers size={14} className="text-blue-700" />
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Urea Bags:</span>
                  <span className="text-sm font-extrabold text-blue-900">
                    {calculations.totalUreaBags} Bags
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 text-[11px]">
                  <span>1st Dose ({cropConfig.topDressing.split1Stage.split("(")[0]}):</span>
                  <span className="font-bold text-slate-900">{calculations.split1UreaBags} Bags</span>
                </div>
                {calculations.split2UreaBags > 0 && (
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>2nd Dose:</span>
                    <span className="font-bold text-slate-900">{calculations.split2UreaBags} Bags</span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Certified Seed & Treatment */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Seed Rate (बीज मात्रा)
                </span>
                <Sprout size={14} className="text-amber-700" />
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between font-bold">
                  <span>Total Seed:</span>
                  <span className="text-sm font-extrabold text-amber-900">
                    {calculations.totalSeedKg} kg
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 leading-snug">
                  Rate: {cropConfig.seedRatePerAcreKg.standard} kg/acre
                </div>
              </div>
            </div>
          </div>

          {/* 3. Cost Estimation Banner & Seed Treatment Advisory */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Estimated Fertilizer Cost (अनुमानित लागत)
                  </h4>
                  <p className="text-[11px] text-slate-500">Based on standard subsidized MRP</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base sm:text-lg font-extrabold text-emerald-800">
                  ₹{calculations.totalFertilizerCost.toLocaleString("en-IN")}
                </span>
                <span className="block text-[10px] text-slate-400">
                  (approx. ₹{calculations.costPerAcre}/acre)
                </span>
              </div>
            </div>

            {/* Seed Treatment Advice */}
            <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
              <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Recommended Seed Treatment (बीज शोधन): </span>
                <span>{cropConfig.seedTreatment}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5 bg-slate-50">
          {/* Voice Readout Button */}
          <button
            type="button"
            onClick={handleVoiceReadout}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              isSpeaking
                ? "bg-amber-100 border-amber-300 text-amber-900 animate-pulse"
                : "bg-white border-slate-200 text-slate-700 hover:text-emerald-800 hover:border-emerald-300"
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={14} className="text-amber-800" />
                <span>Stop Audio</span>
              </>
            ) : (
              <>
                <Volume2 size={14} className="text-emerald-700" />
                <span>बोलकर सुनें (Listen in Hindi)</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
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
                  <span>Copy Prescription</span>
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

export default DosageCalculatorModal;
