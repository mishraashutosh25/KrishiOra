import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Sprout,
  Shield,
  Globe,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Save,
  KeyRound,
  Droplets,
  CreditCard,
  Sparkles,
  RefreshCw,
  Layers,
  Wrench,
  TrendingUp,
  CloudRain,
  Wind,
  Check,
  Building2,
  FileCheck2,
  Award,
  Zap,
  Camera,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import profileService, { type FarmerProfile, type UpdateProfilePayload } from "../services/profile.service";
import { useLanguage } from "../hooks/useLanguage";
import type { LangCode } from "../i18n/translations";
import authService from "../services/auth.service";
import { useNavigate } from "react-router-dom";

const AVATAR_COLORS = [
  { label: "Emerald Agri", value: "from-green-700 to-emerald-900" },
  { label: "Teal Harvest", value: "from-emerald-600 to-teal-800" },
  { label: "Golden Wheat", value: "from-amber-600 to-yellow-800" },
  { label: "Deep Monsoon", value: "from-blue-700 to-indigo-900" },
  { label: "Rich Soil", value: "from-amber-800 to-stone-900" },
  { label: "Charcoal Tech", value: "from-slate-700 to-slate-900" },
];

const SOIL_TYPES = [
  { name: "Alluvial Soil (जलोढ़ मिट्टी)", desc: "High fertility, optimal for Wheat, Rice, Mustard" },
  { name: "Black Cotton Soil (काली मिट्टी)", desc: "High clay content, ideal for Cotton, Soybean, Wheat" },
  { name: "Red & Yellow Loam (लाल व पीली मिट्टी)", desc: "Porous & well-drained, ideal for Pulses & Millets" },
  { name: "Sandy Loam (बलुई दोमट मिट्टी)", desc: "Fast draining, great for Vegetables & Tubers" },
  { name: "Clayey Soil (चिकनी मिट्टी)", desc: "High moisture retention, suitable for Paddy" },
];

const IRRIGATION_METHODS = [
  "Tube-well / Borewell (नलकूप / बोरवेल)",
  "Canal Irrigation (नहरी सिंचाई)",
  "Drip Irrigation (ड्रिप / टपक सिंचाई)",
  "Sprinkler System (फव्वारा सिंचाई)",
  "Rainfed (वर्षा आधारित / बारानी)",
];

const WATER_SOURCES = [
  "Deep Borewell Submersible (>300 ft)",
  "Shallow Tube-well (<150 ft)",
  "Govt Canal Water Lift",
  "Farm Pond / Rainwater Harvesting",
  "River / Stream Lift",
];

const INDIAN_STATES = [
  "Punjab",
  "Haryana",
  "Uttar Pradesh",
  "Madhya Pradesh",
  "Rajasthan",
  "Maharashtra",
  "Gujarat",
  "Bihar",
  "West Bengal",
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Odisha",
  "Chhattisgarh",
];

const COMMON_MACHINERY = [
  { id: "tractor", label: "Tractor (45+ HP)", icon: "🚜" },
  { id: "rotavator", label: "Rotavator / Cultivator", icon: "⚙️" },
  { id: "seed_drill", label: "Zero-Till Seed Drill", icon: "🌱" },
  { id: "power_sprayer", label: "High-Pressure Sprayer", icon: "💨" },
  { id: "harvester", label: "Combine Harvester Access", icon: "🌾" },
  { id: "drip_kit", label: "Automated Drip System", icon: "💧" },
  { id: "solar_pump", label: "Solar Water Pump (KUSUM)", icon: "☀️" },
  { id: "drone", label: "Agri Drone Spraying", icon: "🚁" },
];

const APMC_MANDIS = [
  "Khanna Grain Market (Punjab)",
  "Karnal APMC Mandi (Haryana)",
  "Neemuch Krishi Upaj Mandi (MP)",
  "Kota Mandi (Rajasthan)",
  "Hapur Grain Exchange (UP)",
  "Indore Mandi (MP)",
  "Latur Pulse Market (Maharashtra)",
  "Rajkot Commodity Market (Gujarat)",
  "Guntur Chilli Yard (Andhra)",
];

export const Profile = () => {
  const { lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 5 High-Impact Tabs
  const [activeTab, setActiveTab] = useState<"personal" | "farming" | "schemes" | "machinery" | "security">("personal");

  // Profile State
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Tab 1: Personal & Contact + Avatar Photo
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [state, setState] = useState<string>("Punjab");
  const [district, setDistrict] = useState<string>("Ludhiana");
  const [village, setVillage] = useState<string>("");
  const [avatarGradient, setAvatarGradient] = useState<string>(AVATAR_COLORS[0].value);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Tab 2: Farm & Soil Diagnostics
  const [landholding, setLandholding] = useState<number>(5);
  const [ownershipType, setOwnershipType] = useState<"Self-Owned" | "Leased / Theka" | "Sharecropper / Batai">("Self-Owned");
  const [soilType, setSoilType] = useState<string>(SOIL_TYPES[0].name);
  const [soilPh, setSoilPh] = useState<number>(7.0);
  const [irrigationType, setIrrigationType] = useState<string>(IRRIGATION_METHODS[0]);
  const [waterSource, setWaterSource] = useState<string>(WATER_SOURCES[0]);

  // Tab 3: Govt Schemes & Agri Identity
  const [pmKisanId, setPmKisanId] = useState<string>("");
  const [kccHolder, setKccHolder] = useState<boolean>(true);
  const [kccLimit, setKccLimit] = useState<number>(300000);
  const [soilHealthCardNo, setSoilHealthCardNo] = useState<string>("");
  const [pmfbyInsured, setPmfbyInsured] = useState<boolean>(true);

  // Tab 4: Machinery & Mandi Market
  const [selectedMachinery, setSelectedMachinery] = useState<string[]>(["tractor", "rotavator", "power_sprayer"]);
  const [primaryMandi, setPrimaryMandi] = useState<string>(APMC_MANDIS[0]);
  const [mandiDistance, setMandiDistance] = useState<number>(12);
  const [targetCommodities, setTargetCommodities] = useState<string>("Wheat, Mustard, Paddy");

  // Tab 5: Advisory, Weather & Security
  const [rainAlertThreshold, setRainAlertThreshold] = useState<number>(15);
  const [windAlertThreshold, setWindAlertThreshold] = useState<number>(20);
  const [smsAlerts, setSmsAlerts] = useState<boolean>(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState<boolean>(true);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordLoading, setPasswordLoading] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Auto-calculated Farmer Scale
  const calculateFarmerScale = (acres: number) => {
    if (acres < 2.5) return "Marginal Farmer (< 2.5 Acres)";
    if (acres <= 5.0) return "Small Farmer (2.5 - 5 Acres)";
    if (acres <= 10.0) return "Medium Farmer (5 - 10 Acres)";
    return "Large Commercial Farmer (> 10 Acres)";
  };

  // Image Upload & Optimization Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: lang === "hi" ? "कृपया 5MB से छोटी फोटो चुनें।" : "Please select a photo smaller than 5MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const img = new Image();
      img.src = result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        const optimizedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setAvatarUrl(optimizedBase64);
        setFeedback({
          type: "success",
          message: lang === "hi" ? "फोटो चुन ली गई है! सुरक्षित करने के लिए 'बदलाव सुरक्षित करें' दबाएं।" : "Photo selected! Click 'Save All Changes' to persist.",
        });
      };
    };
    reader.readAsDataURL(file);
  };

  // Remove Photo
  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFeedback({
      type: "success",
      message: lang === "hi" ? "फोटो हटा दी गई। डिफ़ॉल्ट अवतार सेट है।" : "Photo removed. Default avatar palette active.",
    });
  };

  // Load profile on mount
  const loadProfile = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      if (data) {
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
        if (data.avatar_url) setAvatarUrl(data.avatar_url);

        // Parse address if contains commas: "Village, District, State"
        if (data.address) {
          const parts = data.address.split(",").map((p) => p.trim());
          if (parts.length >= 3) {
            setVillage(parts[0]);
            setDistrict(parts[1]);
            setState(parts[2]);
          } else {
            setDistrict(data.address);
          }
        }

        // Farm sync
        if (data.farm) {
          if (data.farm.area) setLandholding(Number(data.farm.area));
          if (data.farm.soil_type) setSoilType(data.farm.soil_type);
          if (data.farm.irrigation_type) setIrrigationType(data.farm.irrigation_type);
          if (data.farm.ownership_type) setOwnershipType(data.farm.ownership_type as any);
        }

        // Metadata load
        const meta = data.metadata || {};
        if (meta.avatar_color) setAvatarGradient(meta.avatar_color);
        if (meta.state) setState(meta.state);
        if (meta.district) setDistrict(meta.district);
        if (meta.village) setVillage(meta.village);

        // Identity
        if (meta.identity) {
          if (meta.identity.pm_kisan_id) setPmKisanId(meta.identity.pm_kisan_id);
          if (meta.identity.kcc_holder !== undefined) setKccHolder(meta.identity.kcc_holder);
          if (meta.identity.kcc_limit_inr) setKccLimit(meta.identity.kcc_limit_inr);
          if (meta.identity.soil_health_card_no) setSoilHealthCardNo(meta.identity.soil_health_card_no);
          if (meta.identity.pmfby_insured !== undefined) setPmfbyInsured(meta.identity.pmfby_insured);
        }

        // Soil Diagnostics
        if (meta.farm_diagnostics) {
          if (meta.farm_diagnostics.soil_ph) setSoilPh(meta.farm_diagnostics.soil_ph);
          if (meta.farm_diagnostics.water_source) setWaterSource(meta.farm_diagnostics.water_source);
        }

        // Machinery
        if (meta.mechanization && Array.isArray(meta.mechanization)) {
          setSelectedMachinery(meta.mechanization);
        }

        // Mandi
        if (meta.mandi_preferences) {
          if (meta.mandi_preferences.primary_mandi) setPrimaryMandi(meta.mandi_preferences.primary_mandi);
          if (meta.mandi_preferences.distance_km) setMandiDistance(meta.mandi_preferences.distance_km);
          if (meta.mandi_preferences.target_commodities) {
            setTargetCommodities(meta.mandi_preferences.target_commodities.join(", "));
          }
        }

        // Weather
        if (meta.weather_preferences) {
          if (meta.weather_preferences.rain_alert_threshold_mm) {
            setRainAlertThreshold(meta.weather_preferences.rain_alert_threshold_mm);
          }
          if (meta.weather_preferences.wind_alert_threshold_kmh) {
            setWindAlertThreshold(meta.weather_preferences.wind_alert_threshold_kmh);
          }
          if (meta.weather_preferences.sms_alerts !== undefined) {
            setSmsAlerts(meta.weather_preferences.sms_alerts);
          }
          if (meta.weather_preferences.whatsapp_alerts !== undefined) {
            setWhatsappAlerts(meta.weather_preferences.whatsapp_alerts);
          }
        }
      }
    } catch (err: any) {
      console.error("Profile load error:", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to load profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Machinery Toggle helper
  const toggleMachinery = (id: string) => {
    setSelectedMachinery((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Save Unified Profile
  const handleSaveProfile = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const formattedAddress = `${village ? village + ", " : ""}${district}, ${state}`;

      const payload: UpdateProfilePayload = {
        full_name: fullName,
        phone: phone,
        address: formattedAddress,
        language: lang,
        avatar_url: avatarUrl || "",
        farm: {
          farm_name: `${fullName || 'My'} Main Farm`,
          area: Number(landholding),
          area_unit: "acres",
          soil_type: soilType,
          irrigation_type: irrigationType,
          ownership_type: ownershipType,
          location: `${district}, ${state}`,
        },
        metadata: {
          avatar_color: avatarGradient,
          state,
          district,
          village,
          identity: {
            farmer_scale: calculateFarmerScale(landholding) as any,
            pm_kisan_id: pmKisanId,
            kcc_holder: kccHolder,
            kcc_limit_inr: Number(kccLimit),
            soil_health_card_no: soilHealthCardNo,
            pmfby_insured: pmfbyInsured,
          },
          farm_diagnostics: {
            landholding_acres: Number(landholding),
            ownership_type: ownershipType,
            soil_type: soilType,
            soil_ph: Number(soilPh),
            irrigation_type: irrigationType,
            water_source: waterSource,
          },
          mechanization: selectedMachinery,
          mandi_preferences: {
            primary_mandi: primaryMandi,
            distance_km: Number(mandiDistance),
            target_commodities: targetCommodities.split(",").map((c) => c.trim()).filter(Boolean),
          },
          weather_preferences: {
            rain_alert_threshold_mm: Number(rainAlertThreshold),
            wind_alert_threshold_kmh: Number(windAlertThreshold),
            sms_alerts: smsAlerts,
            whatsapp_alerts: whatsappAlerts,
          },
        },
      };

      const updated = await profileService.updateProfile(payload);
      setProfile(updated);
      window.dispatchEvent(new CustomEvent("krishiora_profile_updated", { detail: updated }));
      setFeedback({
        type: "success",
        message: lang === "hi" ? "✅ किसान प्रोफाइल व फोटो सफलतापूर्वक सुरक्षित हो गईं!" : "✅ Farmer Profile & Photo successfully saved!",
      });

      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Save profile error:", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to save profile changes. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: "error",
        message: lang === "hi" ? "नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं।" : "New password and confirmation do not match.",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordFeedback({
        type: "error",
        message: lang === "hi" ? "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "Password must be at least 6 characters long.",
      });
      return;
    }

    setPasswordLoading(true);
    try {
      await profileService.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordFeedback({
        type: "success",
        message: lang === "hi" ? "✅ पासवर्ड सफलतापूर्वक बदल दिया गया!" : "✅ Password updated successfully!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordFeedback({
        type: "error",
        message: err?.response?.data?.message || "Failed to update password. Verify current password.",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Sign out
  const handleSignOut = () => {
    authService.logout();
    navigate("/login");
  };

  const getInitials = (name: string) => {
    if (!name) return "KO";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm font-medium">
          {lang === "hi" ? "किसान प्रोफाइल लोड हो रही है..." : "Loading Digital Farmer Passport..."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hidden File Input for Avatar Photo Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900/80 via-slate-900 to-emerald-950 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Interactive Avatar with Camera Upload Trigger */}
            <div className="relative group flex-shrink-0">
              <div
                className={`w-22 h-22 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-emerald-500/40 flex items-center justify-center text-white text-2xl font-black transition-transform group-hover:scale-105 ${
                  avatarUrl ? "bg-slate-900" : `bg-gradient-to-br ${avatarGradient}`
                }`}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Farmer" className="w-full h-full object-cover" />
                ) : (
                  getInitials(fullName || profile?.email || "Kisan")
                )}
              </div>

              {/* Camera Icon Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={lang === "hi" ? "फोटो बदलें या अपलोड करें" : "Upload or Change Photo"}
                className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer ring-2 ring-slate-900 hover:scale-110"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {fullName || "Kisan Sathi"}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {calculateFarmerScale(landholding)}
                </span>
                {pmfbyInsured && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> PMFBY Active
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>{profile?.email}</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  Verified
                </span>
              </p>
              <p className="text-slate-400 text-xs flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{village ? `${village}, ` : ""}{district}, {state}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{lang === "hi" ? "सहेजा जा रहा है..." : "Saving Passport..."}</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{lang === "hi" ? "बदलाव सुरक्षित करें" : "Save All Changes"}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedback && (
          <div
            className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 transition-all ${
              feedback.type === "success"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "bg-red-500/20 text-red-300 border border-red-500/40"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "personal"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{lang === "hi" ? "1. व्यक्तिगत ब्यौरा व फोटो" : "1. Personal & Photo"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("farming")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "farming"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>{lang === "hi" ? "2. खेत व मिट्टी (Soil)" : "2. Farm & Soil Profile"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("schemes")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "schemes"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{lang === "hi" ? "3. सरकारी योजना व KCC" : "3. Govt Schemes & ID"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("machinery")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "machinery"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>{lang === "hi" ? "4. कृषि यंत्र व मंडी" : "4. Machinery & Mandi"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "security"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800/40"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{lang === "hi" ? "5. मौसम, भाषा व सुरक्षा" : "5. Advisory & Security"}</span>
        </button>
      </div>

      {/* TAB 1: Personal & Contact + Photo Upload Section */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Upload Card */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-emerald-400" />
                  <span>{lang === "hi" ? "प्रोफाइल फोटो (Farmer Avatar / Photo)" : "Profile Photo / Avatar"}</span>
                </h2>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === "hi" ? "फोटो हटाएं" : "Remove Photo"}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
                <div
                  className={`w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-2 ring-emerald-500/40 flex items-center justify-center text-white text-xl font-black flex-shrink-0 ${
                    avatarUrl ? "bg-slate-900" : `bg-gradient-to-br ${avatarGradient}`
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(fullName || "Kisan")
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <p className="text-xs text-slate-300">
                    {lang === "hi"
                      ? "अपनी असली फोटो या खेत की फोटो अपलोड करें (JPG, PNG - अधिकतम 5MB)।"
                      : "Upload your photo or farm portrait (JPG, PNG - max 5MB)."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{lang === "hi" ? "गैलरी से फोटो चुनें" : "Choose from Gallery / Files"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Info Card */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                <span>{lang === "hi" ? "व्यक्तिगत जानकारी" : "Personal Information"}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "पूरा नाम" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "मोबाइल नंबर (SMS/WhatsApp)" : "Mobile Number (SMS/Alerts)"}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "राज्य (State)" : "State"}
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st} className="bg-slate-900 text-white">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "जिला (District)" : "District"}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Ludhiana / Sehore"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "गाँव / कस्बा (Village)" : "Village / Town"}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Pipariya"
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Avatar Color Palette (Fallback if no photo) */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === "hi" ? "डिफ़ॉल्ट अवतार रंग थीम" : "Default Avatar Color Palette"}</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AVATAR_COLORS.map((col) => (
                  <button
                    key={col.label}
                    type="button"
                    onClick={() => setAvatarGradient(col.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      avatarGradient === col.value && !avatarUrl
                        ? "bg-emerald-500/15 border-emerald-500/60 text-white ring-1 ring-emerald-500/40"
                        : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${col.value} shadow-md flex-shrink-0 flex items-center justify-center`}>
                      {avatarGradient === col.value && !avatarUrl && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-xs font-medium truncate">{col.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="space-y-6">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FileCheck2 className="w-4 h-4" />
                <span>{lang === "hi" ? "कृषि पासपोर्ट स्थिति" : "Passport Health"}</span>
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <span className="text-slate-400">Account Type</span>
                  <span className="font-semibold text-white">Direct Farmer</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <span className="text-slate-400">Farmer Category</span>
                  <span className="font-semibold text-emerald-400">{calculateFarmerScale(landholding)}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <span className="text-slate-400">Profile Photo</span>
                  <span className="font-semibold text-emerald-400">{avatarUrl ? "Photo Uploaded" : "Color Avatar"}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <span className="text-slate-400">Verified Mobile</span>
                  <span className="font-semibold text-white">{phone ? "Linked" : "Pending"}</span>
                </div>
                <div className="flex justify-between items-center text-xs p-3 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <span className="text-slate-400">Govt Scheme Sync</span>
                  <span className="font-semibold text-amber-400">{pmKisanId ? "PM-Kisan Linked" : "Unlinked"}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                💡 Keeping your passport updated helps our ICAR agronomic algorithms calculate precision fertilizer doses and spray timings for your region.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Farm & Soil Diagnostics */}
      {activeTab === "farming" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-400" />
                  <span>{lang === "hi" ? "खेत, भूमि व मिट्टी का वैज्ञानिक ब्यौरा" : "Farm & Soil Agronomic Diagnostics"}</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Directly synchronizes with your primary farm in the database.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/20">
                DB Mapped: `farms`
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Landholding in Acres */}
              <div className="space-y-3 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{lang === "hi" ? "कुल कृषि भूमि (एकड़)" : "Total Landholding (Acres)"}</span>
                  </label>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {landholding} Acres
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="50"
                  step="0.5"
                  value={landholding}
                  onChange={(e) => setLandholding(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>0.5 Acre (Marginal)</span>
                  <span>10 Acres (Medium)</span>
                  <span>50+ Acres (Commercial)</span>
                </div>
              </div>

              {/* Ownership Type */}
              <div className="space-y-3 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  <span>{lang === "hi" ? "भूमि स्वामित्व प्रकार" : "Land Ownership Type"}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Self-Owned", "Leased / Theka", "Sharecropper / Batai"] as const).map((own) => (
                    <button
                      key={own}
                      type="button"
                      onClick={() => setOwnershipType(own)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        ownershipType === own
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm"
                          : "bg-slate-900/60 text-slate-400 border-slate-700/50 hover:text-white"
                      }`}
                    >
                      {own.split(" ")[0]}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  {ownershipType === "Self-Owned"
                    ? "Eligible for PM-Kisan and direct KCC subsidies."
                    : "Tailored for lease expense tracking in farm accounting."}
                </p>
              </div>
            </div>

            {/* Soil Type Cards */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                {lang === "hi" ? "मिट्टी का प्रकार (Soil Classification)" : "Primary Soil Classification"}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {SOIL_TYPES.map((st) => (
                  <div
                    key={st.name}
                    onClick={() => setSoilType(st.name)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer space-y-1 ${
                      soilType === st.name
                        ? "bg-emerald-500/15 border-emerald-500/60 ring-1 ring-emerald-500/40"
                        : "bg-slate-800/30 border-slate-700/40 hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{st.name.split("(")[0]}</span>
                      {soilType === st.name && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">{st.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Soil pH and Irrigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Soil pH */}
              <div className="space-y-3 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {lang === "hi" ? "मिट्टी का pH मान (Soil pH)" : "Soil pH Level (from Soil Health Card)"}
                  </label>
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400">
                    pH {soilPh} ({soilPh < 6.5 ? "Acidic" : soilPh > 7.5 ? "Alkaline" : "Optimal Neutral"})
                  </span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="9.0"
                  step="0.1"
                  value={soilPh}
                  onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span className="text-amber-400">5.0 (Acidic)</span>
                  <span className="text-emerald-400 font-bold">6.5 - 7.5 (Ideal Crop Growth)</span>
                  <span className="text-blue-400">9.0 (Alkaline)</span>
                </div>
              </div>

              {/* Irrigation Method */}
              <div className="space-y-3 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>{lang === "hi" ? "प्राथमिक सिंचाई विधि" : "Primary Irrigation System"}</span>
                </label>
                <select
                  value={irrigationType}
                  onChange={(e) => setIrrigationType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  {IRRIGATION_METHODS.map((method) => (
                    <option key={method} value={method} className="bg-slate-900 text-white">
                      {method}
                    </option>
                  ))}
                </select>
                <select
                  value={waterSource}
                  onChange={(e) => setWaterSource(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 transition-all mt-2"
                >
                  {WATER_SOURCES.map((ws) => (
                    <option key={ws} value={ws} className="bg-slate-900 text-white">
                      Source: {ws}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Govt Schemes & Digital Kisan ID */}
      {activeTab === "schemes" && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{lang === "hi" ? "सरकारी योजनाएं व डिजिटल किसान पहचान" : "Govt Schemes & Digital Kisan Identity"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Direct integration with Central AgriStack, PM-Kisan & KCC credit limits.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* PM Kisan ID */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>PM-Kisan Registration ID</span>
                  </label>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                    ₹6,000 / Yr
                  </span>
                </div>
                <input
                  type="text"
                  value={pmKisanId}
                  onChange={(e) => setPmKisanId(e.target.value)}
                  placeholder="e.g. PB-2023-998811"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Used for DBT installment verification and localized fertilizer subsidy eligibility.
                </p>
              </div>

              {/* Soil Health Card No */}
              <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/40 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-blue-400" />
                    <span>Soil Health Card (SHC) Number</span>
                  </label>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                    KVK Certified
                  </span>
                </div>
                <input
                  type="text"
                  value={soilHealthCardNo}
                  onChange={(e) => setSoilHealthCardNo(e.target.value)}
                  placeholder="e.g. SHC/2024/LDH/4492"
                  className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <p className="text-[11px] text-slate-400">
                  Enables precision N-P-K nutrient dosage calculation in Crop Planning.
                </p>
              </div>
            </div>

            {/* KCC Status & Limit */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800/50 to-slate-900 p-5 rounded-2xl border border-amber-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Kisan Credit Card (KCC) Holder</h3>
                    <p className="text-xs text-slate-400">Subsidized agricultural crop loan at 4% interest rate</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={kccHolder}
                    onChange={(e) => setKccHolder(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {kccHolder && (
                <div className="pt-3 border-t border-slate-700/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Sanctioned KCC Limit (₹)</label>
                    <input
                      type="number"
                      value={kccLimit}
                      onChange={(e) => setKccLimit(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center text-xs text-slate-400 bg-slate-900/50 p-3 rounded-xl">
                    <span>💡 Automatically integrated into the Expense Intelligence module for interest tracking.</span>
                  </div>
                </div>
              )}
            </div>

            {/* PMFBY Crop Insurance */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/40">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">PMFBY Crop Insurance (प्रधानमंत्री फसल बीमा)</h4>
                  <p className="text-xs text-slate-400">Automated claim advisory on extreme weather alerts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pmfbyInsured}
                  onChange={(e) => setPmfbyInsured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Machinery & Mandi Market */}
      {activeTab === "machinery" && (
        <div className="space-y-6">
          {/* Farm Mechanization Inventory */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <span>{lang === "hi" ? "कृषि यंत्र व साधन (Farm Mechanization Inventory)" : "Farm Mechanization & Machinery Inventory"}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Select equipment you own or have immediate rental access to for accurate operational cost calculations.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {COMMON_MACHINERY.map((mach) => {
                const isSelected = selectedMachinery.includes(mach.id);
                return (
                  <button
                    key={mach.id}
                    type="button"
                    onClick={() => toggleMachinery(mach.id)}
                    className={`p-4 rounded-xl border flex flex-col items-start gap-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-md ring-1 ring-emerald-500/30"
                        : "bg-slate-800/30 border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-2xl">{mach.icon}</span>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isSelected ? "bg-emerald-500 border-emerald-400" : "border-slate-600"
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-xs font-bold">{mach.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mandi & APMC Intelligence Preferences */}
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" />
                <span>{lang === "hi" ? "मंडी व बिक्री प्राथमिकताएं" : "Mandi & APMC Market Intelligence"}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Set your primary grain market for live spot price alerts and logistics planning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === "hi" ? "प्राथमिक मंडी (Nearest APMC Mandi)" : "Nearest APMC Grain Mandi"}
                </label>
                <select
                  value={primaryMandi}
                  onChange={(e) => setPrimaryMandi(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all"
                >
                  {APMC_MANDIS.map((mandi) => (
                    <option key={mandi} value={mandi} className="bg-slate-900 text-white">
                      {mandi}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  {lang === "hi" ? "खेत से दूरी (Distance in KM)" : "Distance from Farm (KM)"}
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="number"
                    value={mandiDistance}
                    onChange={(e) => setMandiDistance(Number(e.target.value))}
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                {lang === "hi" ? "मुख्य फसलें (Target Cash Crops)" : "Primary Target Commodities (comma separated)"}
              </label>
              <input
                type="text"
                value={targetCommodities}
                onChange={(e) => setTargetCommodities(e.target.value)}
                placeholder="e.g. Wheat, Mustard, Paddy, Gram"
                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Weather, Language & Security */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Weather & Advisory Sensitivity */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-blue-400" />
                <span>{lang === "hi" ? "मौसम संवेदनशीलता व भाषा" : "Weather Rules & Language"}</span>
              </h2>

              {/* Language Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "hi" ? "ऐप की भाषा" : "Application Language"}</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLang("en" as LangCode)}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      lang === "en"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md"
                        : "bg-slate-800/40 text-slate-400 border-slate-700/40 hover:text-white"
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang("hi" as LangCode)}
                    className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      lang === "hi"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-md"
                        : "bg-slate-800/40 text-slate-400 border-slate-700/40 hover:text-white"
                    }`}
                  >
                    🇮🇳 हिन्दी (Hindi)
                  </button>
                </div>
              </div>

              {/* Rain Risk Sensitivity Slider */}
              <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-blue-400" />
                    <span>48h Rain Risk Threshold (बारिश अलर्ट सीमा)</span>
                  </label>
                  <span className="text-sm font-black text-blue-400 font-mono">
                    {rainAlertThreshold} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={rainAlertThreshold}
                  onChange={(e) => setRainAlertThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[11px] text-slate-400">
                  If rainfall exceeds <strong>{rainAlertThreshold} mm</strong> within 48h of spraying or fertilization, the system automatically triggers a 1-Click Auto Reschedule alert.
                </p>
              </div>

              {/* Wind Speed Warning Slider */}
              <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Wind className="w-4 h-4 text-cyan-400" />
                    <span>High Wind Spraying Alert (तेज हवा चेतावनी)</span>
                  </label>
                  <span className="text-sm font-black text-cyan-400 font-mono">
                    {windAlertThreshold} km/h
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="35"
                  step="1"
                  value={windAlertThreshold}
                  onChange={(e) => setWindAlertThreshold(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Communication Channels */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Advisory Notification Channels
                </label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-xs font-semibold text-slate-200">SMS Alerts & Reminders</span>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/40">
                  <span className="text-xs font-semibold text-slate-200">WhatsApp Weather Broadcast</span>
                  <input
                    type="checkbox"
                    checked={whatsappAlerts}
                    onChange={(e) => setWhatsappAlerts(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Change Password & Sign Out */}
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 space-y-6 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <span>{lang === "hi" ? "पासवर्ड व खाता सुरक्षा" : "Security & Password"}</span>
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "वर्तमान पासवर्ड" : "Current Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "नया पासवर्ड" : "New Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    {lang === "hi" ? "नये पासवर्ड की पुष्टि करें" : "Confirm New Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {passwordFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      passwordFeedback.type === "success"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-red-500/20 text-red-300 border border-red-500/40"
                    }`}
                  >
                    {passwordFeedback.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    )}
                    <span>{passwordFeedback.message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {passwordLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{lang === "hi" ? "पासवर्ड अपडेट करें" : "Update Password"}</span>
                </button>
              </form>

              {/* Sign Out Card */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Active Session</h4>
                  <p className="text-xs text-slate-500">
                    Last sign in: {profile?.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString() : "Active now"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{lang === "hi" ? "लॉग आउट करें" : "Sign Out"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
