import { Link } from "react-router-dom";
import { Receipt, ArrowRight, IndianRupee, Plus } from "lucide-react";
import { formatINR } from "../../lib/utils";
import type { Expense } from "../../services/expense.service";

interface RecentExpensesCardProps {
  realExpenses?: Expense[];
  totalExpenseAmount?: number;
}

export const RecentExpensesCard = ({ realExpenses = [], totalExpenseAmount = 0 }: RecentExpensesCardProps) => {
  const displayExpenses = realExpenses.slice(0, 4);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100/80 text-green-800">
              <Receipt size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Recent Expenses
              </h2>
              <p className="text-[11px] text-slate-500">
                Live categorized farm spending
              </p>
            </div>
          </div>

          <Link
            to="/expenses"
            className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 hover:text-green-950 transition-colors"
          >
            <span>+ Log Expense</span>
          </Link>
        </div>

        {/* Expenses List */}
        {displayExpenses.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500">No expenses recorded yet.</p>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition-colors"
            >
              <Plus size={13} />
              <span>Record first expense</span>
            </Link>
          </div>
        ) : (
          <div className="mt-3 divide-y divide-slate-100">
            {displayExpenses.map((expense) => (
              <div key={expense.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {expense.item_name}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="font-medium text-slate-700">{expense.category}</span>
                    <span>•</span>
                    <span>
                      {new Date(expense.expense_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    {expense.farms?.farm_name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{expense.farms.farm_name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-extrabold text-slate-950">
                    {formatINR(expense.total_amount)}
                  </p>
                  <span className="inline-block mt-0.5 text-[9px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {expense.payment_method?.split("(")[0] || "Paid"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-600 font-semibold flex items-center gap-1 font-mono">
          <IndianRupee size={13} className="text-slate-400" />
          <span>Total Outflow: ₹{totalExpenseAmount.toLocaleString("en-IN")}</span>
        </span>
        <Link
          to="/expenses"
          className="inline-flex items-center gap-1 font-semibold text-green-800 hover:text-green-950 transition-colors"
        >
          <span>View expense ledger</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
};

export default RecentExpensesCard;
