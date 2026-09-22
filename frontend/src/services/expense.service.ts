import api from "./api";

export type ExpenseCategory =
  | "Seeds & Sowing"
  | "Fertilizer & Nutrients"
  | "Crop Protection & Spray"
  | "Labour & Wages"
  | "Machinery, Diesel & Rent"
  | "Irrigation & Electricity"
  | "Post-Harvest & Transport"
  | "Other";

export interface Expense {
  id: string;
  user_id: string;
  farm_id: string;
  crop_id?: string | null;
  category: ExpenseCategory | string;
  item_name: string;
  description?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  expense_date: string;
  payment_status: "PAID" | "PENDING" | "CREDIT" | string;
  payment_method?: string | null;
  notes?: string | null;
  created_at?: string;
  farms?: {
    id: string;
    farm_name: string;
    area?: number;
    area_unit?: string;
  };
  crops?: {
    id: string;
    crop_name: string;
  };
}

export interface ExpenseSummary {
  total_expense: number;
  total_count: number;
  category_breakdown: Record<string, number>;
}

export interface CreateExpensePayload {
  farm_id?: string;
  crop_id?: string | null;
  category: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  expense_date: string;
  payment_status?: string;
  payment_method?: string;
  notes?: string;
}

export interface ExpenseListResponse {
  success: boolean;
  message: string;
  summary: ExpenseSummary;
  expenses: Expense[];
}

export const expenseService = {
  /**
   * Fetches all expenses and aggregated summary for the authenticated farmer
   */
  async getAllExpenses(params?: {
    category?: string;
    payment_status?: string;
    payment_method?: string;
    from_date?: string;
    to_date?: string;
  }): Promise<ExpenseListResponse> {
    const res = await api.get<ExpenseListResponse>("/expenses", { params });
    return res.data;
  },

  /**
   * Logs a new agricultural expense
   */
  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    const res = await api.post<{ success: boolean; message: string; expense: Expense }>(
      "/expenses",
      payload
    );
    return res.data.expense;
  },

  /**
   * Updates an existing expense entry
   */
  async updateExpense(
    expenseId: string,
    payload: Partial<CreateExpensePayload>
  ): Promise<Expense> {
    const res = await api.patch<{ success: boolean; message: string; expense: Expense }>(
      `/expenses/${expenseId}`,
      payload
    );
    return res.data.expense;
  },

  /**
   * Deletes an expense entry
   */
  async deleteExpense(expenseId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete<{ success: boolean; message: string }>(
      `/expenses/${expenseId}`
    );
    return res.data;
  },
};

export default expenseService;
