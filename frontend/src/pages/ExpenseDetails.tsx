import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Receipt,
  ArrowLeft,
  Calendar,
  CreditCard,
  Building,
  FileText,
  Trash2,
  Edit3,
  Printer,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import expenseService, { type Expense } from "../services/expense.service";
import { useLanguage } from "../hooks/useLanguage";

export const ExpenseDetails = () => {
  const { expenseId } = useParams<{ expenseId: string }>();
  const { lang } = useLanguage();
  const navigate = useNavigate();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchExpense = async () => {
      if (!expenseId) return;
      setLoading(true);
      try {
        const data = await expenseService.getAllExpenses();
        const found = data.expenses.find((e) => e.id === expenseId);
        setExpense(found || null);
      } catch (err) {
        console.error("Error loading expense details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [expenseId]);

  const handleDelete = async () => {
    if (!expense) return;
    if (window.confirm("Are you sure you want to delete this expense voucher?")) {
      try {
        await expenseService.deleteExpense(expense.id);
        navigate("/expenses");
      } catch (err: any) {
        alert("Failed to delete expense: " + err.message);
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading expense receipt...</p>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Expense Record Not Found</h2>
        <p className="text-slate-400 text-sm">This voucher may have been deleted or moved.</p>
        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expense Ledger</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16">
      {/* Top Back & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/expenses"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ledger</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Voucher Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                Official Farm Voucher
              </span>
              <h1 className="text-xl font-black text-white">{expense.item_name}</h1>
              <span className="text-xs text-slate-400">{expense.category}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-500 block">Total Amount</span>
            <span className="text-3xl font-black text-emerald-400 font-mono">
              ₹ {expense.total_amount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Voucher Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-400" />
              <span>Date</span>
            </span>
            <p className="text-xs font-bold text-white">
              {new Date(expense.expense_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-amber-400" />
              <span>Payment Mode</span>
            </span>
            <p className="text-xs font-bold text-amber-400">{expense.payment_method || "Cash"}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Unit Rate</span>
            </span>
            <p className="text-xs font-bold text-white font-mono">
              {expense.quantity} {expense.unit} @ ₹{expense.unit_price}
            </p>
          </div>
        </div>

        {/* Notes & Remarks */}
        {expense.notes && (
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 space-y-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Vendor / Remarks</span>
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">{expense.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetails;