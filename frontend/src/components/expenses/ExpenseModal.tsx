import React, { useState, useEffect } from "react";
import {
  X,
  Receipt,
  Sprout,
  DollarSign,
  Calendar,
  CreditCard,
  Building,
  FileText,
  Sparkles,
  Calculator,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import type { Expense, CreateExpensePayload, ExpenseCategory } from "../../services/expense.service";
import { useLanguage } from "../../hooks/useLanguage";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateExpensePayload) => Promise<any>;
  initialExpense?: Expense | null;
  activeFarmName?: string;
}

export const CATEGORIES: { id: ExpenseCategory; labelEn: string; labelHi: string; icon: string; color: string }[] = [
  { id: "Seeds & Sowing", labelEn: "Seeds & Sowing", labelHi: "बीज व बुआई", icon: "🌱", color: "from-emerald-600 to-teal-700" },
  { id: "Fertilizer & Nutrients", labelEn: "Fertilizer & Nutrients", labelHi: "खाद व उर्वरक (यूरिया/डीएपी)", icon: "🧪", color: "from-blue-600 to-indigo-700" },
  { id: "Crop Protection & Spray", labelEn: "Crop Protection & Spray", labelHi: "कीटनाशक व दवाई स्प्रे", icon: "🛡️", color: "from-amber-600 to-orange-700" },
  { id: "Labour & Wages", labelEn: "Labour & Field Wages", labelHi: "मजदूरी व लेबर खर्च", icon: "👨‍🌾", color: "from-purple-600 to-indigo-800" },
  { id: "Machinery, Diesel & Rent", labelEn: "Machinery, Diesel & Rent", labelHi: "ट्रैक्टर, डीजल व किराया", icon: "🚜", color: "from-yellow-600 to-amber-800" },
  { id: "Irrigation & Electricity", labelEn: "Irrigation & Electricity", labelHi: "सिंचाई, बिजली व पानी", icon: "💧", color: "from-cyan-600 to-blue-700" },
  { id: "Post-Harvest & Transport", labelEn: "Post-Harvest & Transport", labelHi: "कटाई, पैकिंग व मंडी ढुलाई", icon: "📦", color: "from-stone-600 to-slate-800" },
  { id: "Other", labelEn: "Other Miscellaneous", labelHi: "अन्य विविध खर्च", icon: "🏷️", color: "from-slate-600 to-slate-800" },
];

const UNITS = [
  "Bags (बोरी)",
  "Kg (किलो)",
  "Quintal (क्विंटल)",
  "Litres (लीटर)",
  "Labour Days (दिन)",
  "Tractor Hours (घंटे)",
  "Packets (पैकेट)",
  "Acres (एकड़)",
  "Fixed / Lumpsum",
];

const PAYMENT_METHODS = [
  "UPI / Google Pay / PhonePe",
  "Cash (नकद भुगतान)",
  "KCC / Bank Card",
  "Credit / Udhaari (उधारी खाता)",
  "Bank Transfer / Cheque",
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
  activeFarmName,
}) => {
  const { lang } = useLanguage();

  const [category, setCategory] = useState<ExpenseCategory>("Fertilizer & Nutrients");
  const [itemName, setItemName] = useState<string>("");
  const [quantity, setQuantity] = useState<number | string>(1);
  const [unit, setUnit] = useState<string>(UNITS[0]);
  const [unitPrice, setUnitPrice] = useState<number | string>(350);
  const [expenseDate, setExpenseDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [paymentStatus, setPaymentStatus] = useState<string>("PAID");
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS[0]);
  const [notes, setNotes] = useState<string>("");

  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialExpense) {
      setCategory((initialExpense.category as ExpenseCategory) || "Fertilizer & Nutrients");
      setItemName(initialExpense.item_name || "");
      setQuantity(initialExpense.quantity || 1);
      setUnit(initialExpense.unit || UNITS[0]);
      setUnitPrice(initialExpense.unit_price || 0);
      setExpenseDate(initialExpense.expense_date || new Date().toISOString().split("T")[0]);
      setPaymentStatus(initialExpense.payment_status || "PAID");
      setPaymentMethod(initialExpense.payment_method || PAYMENT_METHODS[0]);
      setNotes(initialExpense.notes || "");
    } else {
      setCategory("Fertilizer & Nutrients");
      setItemName("");
      setQuantity(1);
      setUnit(UNITS[0]);
      setUnitPrice(350);
      setExpenseDate(new Date().toISOString().split("T")[0]);
      setPaymentStatus("PAID");
      setPaymentMethod(PAYMENT_METHODS[0]);
      setNotes("");
    }
    setError(null);
  }, [initialExpense, isOpen]);

  if (!isOpen) return null;

  const totalCalculated = Math.round((Number(quantity) || 0) * (Number(unitPrice) || 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      setError(lang === "hi" ? "कृपया खर्च या सामान का नाम दर्ज करें।" : "Please specify item / expense name.");
      return;
    }
    if (Number(quantity) <= 0 || Number(unitPrice) < 0) {
      setError(lang === "hi" ? "कृपया सही मात्रा व दर दर्ज करें।" : "Please enter valid quantity and price.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload: CreateExpensePayload = {
        category,
        item_name: itemName.trim(),
        quantity: Number(quantity),
        unit,
        unit_price: Number(unitPrice),
        expense_date: expenseDate,
        payment_status: paymentStatus,
        payment_method: paymentMethod,
        notes: notes.trim() || undefined,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save expense entry");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/30 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {initialExpense
                  ? lang === "hi"
                    ? "खर्च प्रविष्टि संपादित करें"
                    : "Edit Expense Entry"
                  : lang === "hi"
                  ? "नया कृषि खर्च दर्ज करें"
                  : "Log Farm Expense"}
              </h2>
              <p className="text-xs text-slate-400">
                {activeFarmName ? `Linked to: ${activeFarmName}` : "Direct Input Ledger"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category Select Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === "hi" ? "खर्च श्रेणी (Category)" : "Expense Category"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                      isSelected
                        ? "bg-emerald-500/20 border-emerald-500/70 text-white shadow-sm ring-1 ring-emerald-500/50"
                        : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/80 hover:text-white"
                    }`}
                  >
                    <span className="text-lg flex-shrink-0">{cat.icon}</span>
                    <span className="text-xs font-bold truncate">
                      {lang === "hi" ? cat.labelHi.split(" ")[0] : cat.labelEn.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Item Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {lang === "hi" ? "सामान या सेवा का नाम (Item / Work Name)" : "Item / Service Title"}
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g. IFFCO Urea (45kg bag), Diesel for Field Ploughing, Weeding Labour"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quantity, Unit & Unit Price -> Total Math */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === "hi" ? "मात्रा (Quantity)" : "Quantity"}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === "hi" ? "इकाई (Unit)" : "Unit"}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u} className="bg-slate-900 text-white">
                    {u}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === "hi" ? "दर प्रति इकाई (₹ Rate)" : "Unit Price (₹)"}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Auto-Calculated Total Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border border-emerald-500/30 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2 text-slate-300 text-xs">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>{lang === "hi" ? "कुल देय राशि (Total Amount):" : "Calculated Total Amount:"}</span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              ₹ {totalCalculated.toLocaleString("en-IN")}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>{lang === "hi" ? "खर्च की तारीख" : "Expense Date"}</span>
              </label>
              <input
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === "hi" ? "भुगतान माध्यम (Mode)" : "Payment Mode"}</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm} className="bg-slate-900 text-white">
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes & Bill No */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{lang === "hi" ? "दुकानदार का नाम या बिल विवरण (Notes)" : "Vendor Name / Bill Remarks"}</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Kisan Seva Kendra, Bill #4912, 2 bags applied to East Plot"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition-all cursor-pointer"
            >
              {lang === "hi" ? "रद्द करें" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{lang === "hi" ? "सुरक्षित हो रहा है..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === "hi" ? "खर्च दर्ज करें" : "Save Expense"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
