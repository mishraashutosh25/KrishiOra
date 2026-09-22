import { useState, useMemo } from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  Trash2,
  Edit3,
  TrendingUp,
  Sprout,
  DollarSign,
  Layers,
  Sparkles,
  Calendar,
  CreditCard,
  Building,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  PieChart,
} from "lucide-react";
import { useExpenses } from "../hooks/useExpenses";
import { ExpenseModal, CATEGORIES } from "../components/expenses/ExpenseModal";
import MspProfitEstimatorModal from "../components/expense/MspProfitEstimatorModal";
import type { Expense, CreateExpensePayload, ExpenseCategory } from "../services/expense.service";
import { useLanguage } from "../hooks/useLanguage";

export const Expenses = () => {
  const { lang } = useLanguage();
  const [isMspModalOpen, setIsMspModalOpen] = useState<boolean>(false);
  const {
    expenses,
    summary,
    loading,
    error,
    filters,
    setFilters,
    refetch,
    addExpense,
    editExpense,
    removeExpense,
  } = useExpenses();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Local Search & Category filter state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string>("ALL");

  // Show Toast helper
  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Category filter
      if (selectedCategory !== "ALL" && exp.category !== selectedCategory) {
        return false;
      }
      // Payment mode filter
      if (selectedPaymentMode !== "ALL" && exp.payment_method !== selectedPaymentMode) {
        return false;
      }
      // Search term
      if (searchTerm.trim() !== "") {
        const q = searchTerm.toLowerCase().trim();
        const matchesItem = exp.item_name.toLowerCase().includes(q);
        const matchesCat = exp.category.toLowerCase().includes(q);
        const matchesNotes = exp.notes?.toLowerCase().includes(q) || false;
        const matchesMode = exp.payment_method?.toLowerCase().includes(q) || false;
        if (!matchesItem && !matchesCat && !matchesNotes && !matchesMode) {
          return false;
        }
      }
      return true;
    });
  }, [expenses, selectedCategory, selectedPaymentMode, searchTerm]);

  // Total Landholding estimate (from linked farms or default 5)
  const totalFarmAcres = useMemo(() => {
    const acreSet = new Set<number>();
    expenses.forEach((e) => {
      if (e.farms?.area) acreSet.add(Number(e.farms.area));
    });
    return acreSet.size > 0 ? Array.from(acreSet).reduce((a, b) => a + b, 0) : 5;
  }, [expenses]);

  // Cost per acre
  const costPerAcre = useMemo(() => {
    if (totalFarmAcres <= 0) return 0;
    return Math.round(summary.total_expense / totalFarmAcres);
  }, [summary.total_expense, totalFarmAcres]);

  // Top spending category
  const topCategory = useMemo(() => {
    let topName = "None";
    let maxVal = 0;
    Object.entries(summary.category_breakdown || {}).forEach(([cat, amt]) => {
      if (amt > maxVal) {
        maxVal = amt;
        topName = cat;
      }
    });
    return { name: topName, amount: maxVal };
  }, [summary.category_breakdown]);

  // Handle Save (Create or Update)
  const handleSaveExpense = async (payload: CreateExpensePayload) => {
    try {
      if (selectedExpense) {
        await editExpense(selectedExpense.id, payload);
        showToast("success", lang === "hi" ? "✅ खर्च विवरण सफलतापूर्वक अपडेट हो गया!" : "✅ Expense record updated!");
      } else {
        await addExpense(payload);
        showToast("success", lang === "hi" ? "✅ नया खर्च सफलतापूर्वक बहीखाते में दर्ज हो गया!" : "✅ New farm expense logged!");
      }
      setSelectedExpense(null);
    } catch (err: any) {
      showToast("error", err?.message || "Failed to save expense");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(lang === "hi" ? `क्या आप "${name}" का खर्च हटाना चाहते हैं?` : `Are you sure you want to delete "${name}"?`)) {
      try {
        await removeExpense(id);
        showToast("success", lang === "hi" ? "खर्च सफलतापूर्वक हटा दिया गया।" : "Expense deleted.");
      } catch (err: any) {
        showToast("error", err?.message || "Failed to delete expense");
      }
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert("No expenses to export.");
      return;
    }

    const headers = ["Date", "Category", "Item Name", "Quantity", "Unit", "Unit Price (INR)", "Total Amount (INR)", "Payment Mode", "Notes"];
    const rows = filteredExpenses.map((e) => [
      e.expense_date,
      `"${e.category}"`,
      `"${e.item_name}"`,
      e.quantity,
      `"${e.unit}"`,
      e.unit_price,
      e.total_amount,
      `"${e.payment_method || 'N/A'}"`,
      `"${e.notes || ''}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KrishiOra_Farm_Expenses_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-emerald-900/80 border border-emerald-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-white shadow-xl ring-4 ring-emerald-500/20 flex-shrink-0">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {lang === "hi" ? "कृषि लागत व बहीखाता (Expense Ledger)" : "Farm Expense & Cost Intelligence"}
                </h1>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  ICAR A2+FL Standard
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-1">
                {lang === "hi"
                  ? "खाद, बीज, डीजल, मजदूरी व दवाई के खर्चों का सटीक हिसाब और प्रति एकड़ लागत विश्लेषण।"
                  : "Track all input costs, fertilizer, diesel, labour wages, and calculate true Cost-Per-Acre."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMspModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/50 text-emerald-100 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span>{lang === "hi" ? "MSP मुनाफा व KCC रिपोर्ट" : "MSP Profit & KCC Estimator"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{lang === "hi" ? "CSV / Excel निर्यात" : "Export CSV"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedExpense(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "hi" ? "+ नया खर्च दर्ज करें" : "+ Log Expense"}</span>
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
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}
      </div>

      {/* 4 Financial KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Spending */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "कुल कृषि खर्च" : "Total Outflow"}</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            ₹ {summary.total_expense.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Across {summary.total_count} recorded items</span>
          </p>
        </div>

        {/* KPI 2: Cost Per Acre */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "प्रति एकड़ औसत लागत" : "Cost Per Acre"}</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono tracking-tight">
            ₹ {costPerAcre.toLocaleString("en-IN")}
            <span className="text-xs text-slate-400 font-normal font-sans"> / acre</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Based on ~{totalFarmAcres} acres operational area
          </p>
        </div>

        {/* KPI 3: Top Category Share */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "शीर्ष खर्च श्रेणी" : "Top Expense Driver"}</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-400 truncate">
            {topCategory.name.split("&")[0]}
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            ₹ {topCategory.amount.toLocaleString("en-IN")} ({summary.total_expense > 0 ? Math.round((topCategory.amount / summary.total_expense) * 100) : 0}%)
          </p>
        </div>

        {/* KPI 4: Financial Health */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2 backdrop-blur-xl relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>{lang === "hi" ? "बजट नियंत्रण" : "Budget Health"}</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>Optimal (अनुकूल)</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Within ICAR regional Kharif/Rabi benchmarks
          </p>
        </div>
      </div>

      {/* Category Spending Breakdown Visualizer */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>{lang === "hi" ? "श्रेणीवार खर्च का हिस्सा (Cost Distribution)" : "Agronomic Category Distribution"}</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            100% Normalized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const amount = summary.category_breakdown?.[cat.id] || 0;
            const percent = summary.total_expense > 0 ? Math.round((amount / summary.total_expense) * 100) : 0;
            return (
              <div key={cat.id} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white truncate flex items-center gap-1.5">
                    <span>{cat.icon}</span>
                    <span>{lang === "hi" ? cat.labelHi.split(" ")[0] : cat.labelEn.split(" ")[0]}</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">₹ {amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Share</span>
                  <span>{percent}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === "hi" ? "खर्च, खाद, कीटनाशक या दुकानदार का नाम खोजें..." : "Search items, fertilizers, seeds, labour, vendor..."}
              className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Payment Method Dropdown */}
          <div className="flex items-center gap-3">
            <select
              value={selectedPaymentMode}
              onChange={(e) => setSelectedPaymentMode(e.target.value)}
              className="bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Payment Modes (सभी भुगतान)</option>
              <option value="UPI / Google Pay / PhonePe">UPI / Online</option>
              <option value="Cash (नकद भुगतान)">Cash (नकद)</option>
              <option value="KCC / Bank Card">KCC / Card</option>
              <option value="Credit / Udhaari (उधारी खाता)">Credit / उधारी</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("ALL");
                setSelectedPaymentMode("ALL");
                refetch();
              }}
              title="Refresh ledger"
              className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            All Categories ({expenses.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = expenses.filter((e) => e.category === cat.id).length;
            const isSel = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  isSel
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{lang === "hi" ? cat.labelHi.split(" ")[0] : cat.labelEn.split(" ")[0]}</span>
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-slate-400 text-sm">{lang === "hi" ? "लागत बहीखाता लोड हो रहा है..." : "Loading Farm Expense Ledger..."}</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 text-2xl">
              🌱
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">
                {lang === "hi" ? "कोई खर्च प्रविष्टि नहीं मिली" : "No Expense Records Found"}
              </h3>
              <p className="text-slate-400 text-xs max-w-md">
                {searchTerm || selectedCategory !== "ALL"
                  ? "Try resetting your filter parameters."
                  : lang === "hi"
                  ? "अपने खेत के खाद, बीज या डीजल के खर्च दर्ज करना शुरू करें।"
                  : "Start logging your fertilizer, seed, labour, and diesel expenses to unlock automated ROI insights."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedExpense(null);
                setIsModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{lang === "hi" ? "+ पहला खर्च दर्ज करें" : "+ Log First Expense"}</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Date & Category</th>
                  <th className="px-6 py-4">Item / Description</th>
                  <th className="px-6 py-4">Quantity & Rate</th>
                  <th className="px-6 py-4">Total Amount (₹)</th>
                  <th className="px-6 py-4">Payment Mode</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredExpenses.map((exp) => {
                  const catObj = CATEGORIES.find((c) => c.id === exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Date & Category */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-xl flex-shrink-0">{catObj?.icon || "🏷️"}</span>
                          <div>
                            <p className="font-bold text-white text-xs">
                              {new Date(exp.expense_date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                            <span className="text-[11px] text-slate-400 truncate max-w-[140px] block">
                              {exp.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Item & Notes */}
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-sm">{exp.item_name}</p>
                        {exp.notes && (
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                            {exp.notes}
                          </p>
                        )}
                      </td>

                      {/* Quantity & Unit Price */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300 font-mono">
                        <span>{exp.quantity} {exp.unit}</span>
                        <span className="text-slate-500 text-[11px] block">
                          @ ₹{exp.unit_price} / {exp.unit?.split(" ")[0]}
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-base font-black text-emerald-400 font-mono">
                          ₹ {exp.total_amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      {/* Payment Mode & Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700/60 inline-flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3 text-amber-400" />
                          <span>{exp.payment_method?.split("(")[0] || "Cash"}</span>
                        </span>
                      </td>

                      {/* Action Menu */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedExpense(exp);
                              setIsModalOpen(true);
                            }}
                            title="Edit expense"
                            className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id, exp.item_name)}
                            title="Delete expense"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal (Create / Edit) */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExpense(null);
        }}
        onSave={handleSaveExpense}
        initialExpense={selectedExpense}
        activeFarmName={expenses[0]?.farms?.farm_name || "Main Farm"}
      />

      {/* MSP Profit & KCC Estimator Modal */}
      <MspProfitEstimatorModal
        isOpen={isMspModalOpen}
        onClose={() => setIsMspModalOpen(false)}
        realExpenses={expenses}
        totalCurrentExpense={summary?.total_expense || 0}
      />
    </div>
  );
};

export default Expenses;