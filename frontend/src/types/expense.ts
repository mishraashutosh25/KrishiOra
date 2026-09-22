export type ExpenseCategory =
  | "Seeds & Inputs"
  | "Fertilizer & Nutrition"
  | "Labour"
  | "Equipment & Machinery"
  | "Irrigation & Water"
  | "Pesticides & Protection"
  | "Fuel & Transport"
  | "Other";

export interface Expense {
  id: string;
  farmId: string;
  farmName: string;
  cropId?: string;
  cropName?: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  paymentMethod: "UPI / Net Banking" | "Cash" | "KCC / Card" | "Credit / Cheque";
  vendorName?: string;
  notes?: string;
  receiptNumber?: string;
  createdAt?: string;
}

export interface CreateExpenseInput {
  farmId: string;
  cropId?: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  date: string;
  paymentMethod: Expense["paymentMethod"];
  vendorName?: string;
  notes?: string;
}
