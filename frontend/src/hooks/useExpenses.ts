import { useState, useEffect, useCallback } from "react";
import expenseService, {
  type Expense,
  type ExpenseSummary,
  type CreateExpensePayload,
} from "../services/expense.service";

export interface ExpenseFilters {
  category?: string;
  payment_status?: string;
  payment_method?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
}

export const useExpenses = (initialFilters?: ExpenseFilters) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    total_expense: 0,
    total_count: 0,
    category_breakdown: {},
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters || {});

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await expenseService.getAllExpenses({
        category: filters.category,
        payment_status: filters.payment_status,
        payment_method: filters.payment_method,
        from_date: filters.from_date,
        to_date: filters.to_date,
      });

      let list = data.expenses || [];
      if (filters.search && filters.search.trim() !== "") {
        const query = filters.search.toLowerCase().trim();
        list = list.filter(
          (e) =>
            e.item_name.toLowerCase().includes(query) ||
            e.category.toLowerCase().includes(query) ||
            e.notes?.toLowerCase().includes(query) ||
            e.payment_method?.toLowerCase().includes(query)
        );
      }

      setExpenses(list);
      setSummary(data.summary || { total_expense: 0, total_count: 0, category_breakdown: {} });
    } catch (err: any) {
      console.error("Error fetching expenses:", err);
      setError(err?.response?.data?.message || "Failed to load farm expenses");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const addExpense = async (payload: CreateExpensePayload): Promise<Expense> => {
    const created = await expenseService.createExpense(payload);
    await fetchExpenses();
    return created;
  };

  const editExpense = async (
    id: string,
    payload: Partial<CreateExpensePayload>
  ): Promise<Expense> => {
    const updated = await expenseService.updateExpense(id, payload);
    await fetchExpenses();
    return updated;
  };

  const removeExpense = async (id: string): Promise<void> => {
    await expenseService.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    await fetchExpenses();
  };

  return {
    expenses,
    summary,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchExpenses,
    addExpense,
    editExpense,
    removeExpense,
  };
};

export default useExpenses;
