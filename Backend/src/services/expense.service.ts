import { supabaseAdmin } from "../config/supabase";


interface CreateExpenseData {
  user_id: string;
  farm_id: string;
  crop_id?: string;
  category: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  expense_date: string;
  payment_status: string;
  payment_method?: string;
  notes?: string;
}

interface UpdateExpenseData {
  category?: string;
  item_name?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  expense_date?: string;
  payment_status?: string;
  payment_method?: string;
  notes?: string;
}


export const verifyFarmOwnership = async (
  farmId: string,
  userId: string
): Promise<boolean> => {
  const { data: farm, error } = await supabaseAdmin
    .from("farms")
    .select("id")
    .eq("id", farmId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to verify farm ownership: ${error.message}`
    );
  }

  return !!farm;
};


export const verifyCropBelongsToFarm = async (
  cropId: string,
  farmId: string
): Promise<boolean> => {
  const { data: crop, error } = await supabaseAdmin
    .from("crops")
    .select("id")
    .eq("id", cropId)
    .eq("farm_id", farmId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to verify crop: ${error.message}`
    );
  }

  return !!crop;
};


export const createExpenseService = async (
  data: CreateExpenseData
) => {
  // 1. Verify farm ownership
  const isOwner = await verifyFarmOwnership(
    data.farm_id,
    data.user_id
  );

  if (!isOwner) {
    throw new Error(
      "You do not have access to this farm"
    );
  }

  // 2. Verify crop if provided
  if (data.crop_id) {
    const cropBelongsToFarm =
      await verifyCropBelongsToFarm(
        data.crop_id,
        data.farm_id
      );

    if (!cropBelongsToFarm) {
      throw new Error(
        "Selected crop does not belong to this farm"
      );
    }
  }

  // 3. Calculate total amount
  const total_amount =
    data.quantity * data.unit_price;

  // 4. Insert expense
  const {
    data: expense,
    error
  } = await supabaseAdmin
    .from("expenses")
    .insert({
      user_id: data.user_id,
      farm_id: data.farm_id,
      crop_id: data.crop_id ?? null,
      category: data.category,
      item_name: data.item_name,
      description: data.description ?? null,
      quantity: data.quantity,
      unit: data.unit,
      unit_price: data.unit_price,
      total_amount,
      expense_date: data.expense_date,
      payment_status: data.payment_status,
      payment_method:
        data.payment_method ?? null,
      notes: data.notes ?? null
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create expense: ${error.message}`
    );
  }

  return expense;
};


export const getExpensesService = async (
  farmId: string,
  userId: string,
  category?: string,
  payment_status?: string,
  payment_method?: string,
  expense_date?: string,
  from_date?: string,
  to_date?: string
) => {
  // 1. Verify farm ownership
  const isOwner = await verifyFarmOwnership(
    farmId,
    userId
  );

  if (!isOwner) {
    throw new Error(
      "You do not have access to this farm"
    );
  }

  // 2. Base query
  let query = supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("farm_id", farmId)
    .eq("user_id", userId);

  // 3. Category filter
  if (category) {
    query = query.eq(
      "category",
      category
    );
  }

  // 4. Payment status filter
  if (payment_status) {
    query = query.eq(
      "payment_status",
      payment_status
    );
  }

  // 5. Payment method filter
  if (payment_method) {
    query = query.eq(
      "payment_method",
      payment_method
    );
  }

  // 6. Exact date filter
  if (expense_date) {
    query = query.eq(
      "expense_date",
      expense_date
    );
  }

  // 7. From date
  if (from_date) {
    query = query.gte(
      "expense_date",
      from_date
    );
  }

  // 8. To date
  if (to_date) {
    query = query.lte(
      "expense_date",
      to_date
    );
  }

  // 9. Execute query
  const {
    data: expenses,
    error
  } = await query.order(
    "expense_date",
    {
      ascending: false
    }
  );

  if (error) {
    throw new Error(
      `Failed to fetch expenses: ${error.message}`
    );
  }

  const expenseList = expenses || [];

  // ====================================================
  // SUMMARY
  // ====================================================

  // Total
  const total_expense =
    expenseList.reduce(
      (total, expense) =>
        total +
        Number(
          expense.total_amount || 0
        ),
      0
    );

  // Average
  const average_expense =
    expenseList.length > 0
      ? Number(
          (
            total_expense /
            expenseList.length
          ).toFixed(2)
        )
      : 0;

  // Highest
  const highest_expense =
    expenseList.length > 0
      ? Math.max(
          ...expenseList.map(
            (expense) =>
              Number(
                expense.total_amount || 0
              )
          )
        )
      : 0;

  // Lowest
  const lowest_expense =
    expenseList.length > 0
      ? Math.min(
          ...expenseList.map(
            (expense) =>
              Number(
                expense.total_amount || 0
              )
          )
        )
      : 0;

  // ====================================================
  // CATEGORY SUMMARY
  // ====================================================

  const category_summary: Record<
    string,
    number
  > = {};

  expenseList.forEach((expense) => {
    const category =
      expense.category || "Other";

    const amount =
      Number(
        expense.total_amount || 0
      );

    category_summary[category] =
      (category_summary[category] || 0) +
      amount;
  });

  // ====================================================
  // PAYMENT STATUS SUMMARY
  // ====================================================

  const payment_status_summary: Record<
    string,
    number
  > = {};

  expenseList.forEach((expense) => {
    const status =
      expense.payment_status ||
      "UNKNOWN";

    const amount =
      Number(
        expense.total_amount || 0
      );

    payment_status_summary[status] =
      (payment_status_summary[status] || 0) +
      amount;
  });

  // ====================================================
  // PAYMENT METHOD SUMMARY
  // ====================================================

  const payment_method_summary: Record<
    string,
    number
  > = {};

  expenseList.forEach((expense) => {
    const method =
      expense.payment_method ||
      "UNKNOWN";

    const amount =
      Number(
        expense.total_amount || 0
      );

    payment_method_summary[method] =
      (payment_method_summary[method] || 0) +
      amount;
  });

  // ====================================================
  // FINAL SUMMARY
  // ====================================================

  const summary = {
    total_expense,
    average_expense,
    highest_expense,
    lowest_expense,
    category_summary,
    payment_status_summary,
    payment_method_summary
  };

  return {
    expenses: expenseList,
    summary
  };
};


export const getExpenseByIdService = async (
  farmId: string,
  expenseId: string,
  userId: string
) => {
  // 1. Verify farm ownership
  const isOwner = await verifyFarmOwnership(
    farmId,
    userId
  );

  if (!isOwner) {
    throw new Error(
      "You do not have access to this farm"
    );
  }

  // 2. Fetch expense
  const {
    data: expense,
    error
  } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .eq("farm_id", farmId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch expense: ${error.message}`
    );
  }

  return expense;
};


export const updateExpenseService = async (
  farmId: string,
  expenseId: string,
  userId: string,
  data: UpdateExpenseData
) => {
  // 1. Verify farm ownership
  const isOwner = await verifyFarmOwnership(
    farmId,
    userId
  );

  if (!isOwner) {
    throw new Error(
      "You do not have access to this farm"
    );
  }

  // 2. Get existing expense
  const {
    data: existingExpense,
    error: fetchError
  } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .eq("farm_id", farmId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      `Failed to fetch expense: ${fetchError.message}`
    );
  }

  if (!existingExpense) {
    return null;
  }

  // 3. Validate quantity
  if (
    data.quantity !== undefined &&
    data.quantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than 0"
    );
  }

  // 4. Validate unit price
  if (
    data.unit_price !== undefined &&
    data.unit_price < 0
  ) {
    throw new Error(
      "Unit price cannot be negative"
    );
  }

  // 5. Recalculate total
  const quantity =
    data.quantity ??
    existingExpense.quantity;

  const unit_price =
    data.unit_price ??
    existingExpense.unit_price;

  const total_amount =
    quantity * unit_price;

  // 6. Update expense
  const {
    data: updatedExpense,
    error: updateError
  } = await supabaseAdmin
    .from("expenses")
    .update({
      ...data,
      total_amount
    })
    .eq("id", expenseId)
    .eq("farm_id", farmId)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    throw new Error(
      `Failed to update expense: ${updateError.message}`
    );
  }

  return updatedExpense;
};


export const deleteExpenseService = async (
  farmId: string,
  expenseId: string,
  userId: string
) => {
  // 1. Verify farm ownership
  const isOwner = await verifyFarmOwnership(
    farmId,
    userId
  );

  if (!isOwner) {
    throw new Error(
      "You do not have access to this farm"
    );
  }

  // 2. Check expense exists
  const {
    data: existingExpense,
    error: fetchError
  } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("id", expenseId)
    .eq("farm_id", farmId)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    throw new Error(
      `Failed to fetch expense: ${fetchError.message}`
    );
  }

  if (!existingExpense) {
    throw new Error(
      "Expense not found"
    );
  }

  // 3. Delete
  const {
    error: deleteError
  } = await supabaseAdmin
    .from("expenses")
    .delete()
    .eq("id", expenseId)
    .eq("farm_id", farmId)
    .eq("user_id", userId);

  if (deleteError) {
    throw new Error(
      `Failed to delete expense: ${deleteError.message}`
    );
  }

  return existingExpense;
};


export const getTopExpensesService = async (
  farmId: string,
  userId: string,
  k: number
) => {
  // 1. Verify farm ownership
  const isOwner = await verifyFarmOwnership(
    farmId,
    userId
  );

  if (!isOwner) {
    throw new Error(
      "You do not have access to this farm"
    );
  }

  // 2. Fetch expenses
  const {
    data: expenses,
    error
  } = await supabaseAdmin
    .from("expenses")
    .select("*")
    .eq("farm_id", farmId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(
      `Failed to fetch expenses: ${error.message}`
    );
  }

  if (!expenses || expenses.length === 0) {
    return [];
  }

  // ====================================================
  // MIN HEAP
  // ====================================================

  const heap: any[] = [];

  const swap = (
    i: number,
    j: number
  ) => {
    const temp = heap[i];

    heap[i] = heap[j];
    heap[j] = temp;
  };

  // Move element upward
  const heapifyUp = (
    index: number
  ) => {
    while (index > 0) {
      const parent =
        Math.floor(
          (index - 1) / 2
        );

      if (
        Number(
          heap[parent].total_amount
        ) <=
        Number(
          heap[index].total_amount
        )
      ) {
        break;
      }

      swap(parent, index);

      index = parent;
    }
  };

  // Move element downward
  const heapifyDown = (
    index: number
  ) => {
    while (true) {
      const left =
        2 * index + 1;

      const right =
        2 * index + 2;

      let smallest = index;

      if (
        left < heap.length &&
        Number(
          heap[left].total_amount
        ) <
          Number(
            heap[smallest].total_amount
          )
      ) {
        smallest = left;
      }

      if (
        right < heap.length &&
        Number(
          heap[right].total_amount
        ) <
          Number(
            heap[smallest].total_amount
          )
      ) {
        smallest = right;
      }

      if (
        smallest === index
      ) {
        break;
      }

      swap(
        index,
        smallest
      );

      index = smallest;
    }
  };

  // Insert into heap
  const push = (
    expense: any
  ) => {
    heap.push(expense);

    heapifyUp(
      heap.length - 1
    );
  };

  // Remove minimum
  const pop = () => {
    if (heap.length === 0) {
      return null;
    }

    if (heap.length === 1) {
      return heap.pop();
    }

    const minimum =
      heap[0];

    heap[0] =
      heap.pop()!;

    heapifyDown(0);

    return minimum;
  };

  // ====================================================
  // PROCESS ALL EXPENSES
  // ====================================================

  for (
    const expense of expenses
  ) {
    push(expense);

    // Keep only K largest expenses
    if (
      heap.length > k
    ) {
      pop();
    }
  }

  // ====================================================
  // SORT TOP K RESULTS
  // ====================================================

  const topExpenses =
    [...heap].sort(
      (a, b) =>
        Number(
          b.total_amount
        ) -
        Number(
          a.total_amount
        )
    );

  return topExpenses;
};