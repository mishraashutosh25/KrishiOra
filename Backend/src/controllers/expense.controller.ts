import { Request, Response } from "express";

import {
  createExpenseService,
  verifyFarmOwnership,
  getExpensesService,
  getExpenseByIdService,
  updateExpenseService,
  deleteExpenseService,
  getTopExpensesService
} from "../services/expense.service";

export const createExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const { farmId } = req.params;
    const userId = (req as any).user.id;

    // Validate farm ID
    if (!farmId || Array.isArray(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID"
      });
    }

    // Verify farm ownership
    const isOwner = await verifyFarmOwnership(
      farmId,
      userId
    );

    if (!isOwner) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this farm"
      });
    }

    // Get expense data
    const {
      crop_id,
      category,
      item_name,
      description,
      quantity,
      unit,
      unit_price,
      expense_date,
      payment_status,
      payment_method,
      notes
    } = req.body;

    // Validate required fields
    if (
      !category ||
      !item_name ||
      quantity === undefined ||
      !unit ||
      unit_price === undefined ||
      !expense_date ||
      !payment_status
    ) {
      return res.status(400).json({
        success: false,
        message: "Required expense fields are missing"
      });
    }

    // Validate quantity
    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than 0"
      });
    }

    // Validate unit price
    if (unit_price < 0) {
      return res.status(400).json({
        success: false,
        message: "Unit price cannot be negative"
      });
    }

    // Create expense
    const expense = await createExpenseService({
      user_id: userId,
      farm_id: farmId,
      crop_id,
      category,
      item_name,
      description,
      quantity,
      unit,
      unit_price,
      expense_date,
      payment_status,
      payment_method,
      notes
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      expense
    });
  } catch (error: any) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

export const getExpenses = async (
  req: Request,
  res: Response
) => {
  try {
    const { farmId } = req.params;
    const userId = (req as any).user.id;

    const {
      category,
      payment_status,
      payment_method,
      expense_date,
      from_date,
      to_date
    } = req.query;

    // Validate farm ID
    if (!farmId || Array.isArray(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID"
      });
    }

    // Get expenses and summary
    const result = await getExpensesService(
      farmId,
      userId,
      category as string | undefined,
      payment_status as string | undefined,
      payment_method as string | undefined,
      expense_date as string | undefined,
      from_date as string | undefined,
      to_date as string | undefined
    );

    const {
      expenses,
      summary
    } = result;

    return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      count: expenses.length,
      summary,
      expenses
    });
  } catch (error: any) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error"
    });
  }
};


export const getExpenseById = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      farmId,
      expenseId
    } = req.params;

    const userId = (req as any).user.id;

    // Validate IDs
    if (
      !farmId ||
      Array.isArray(farmId) ||
      !expenseId ||
      Array.isArray(expenseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID or expense ID"
      });
    }

    // Get expense
    const expense = await getExpenseByIdService(
      farmId,
      expenseId,
      userId
    );

    // Expense not found
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense fetched successfully",
      expense
    });
  } catch (error: any) {
    console.error(
      "Get expense by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error"
    });
  }
};


export const updateExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      farmId,
      expenseId
    } = req.params;

    const userId = (req as any).user.id;

    // Validate IDs
    if (
      !farmId ||
      Array.isArray(farmId) ||
      !expenseId ||
      Array.isArray(expenseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID or expense ID"
      });
    }

    // Validate update body
    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

    // Update expense
    const expense = await updateExpenseService(
      farmId,
      expenseId,
      userId,
      req.body
    );

    // Expense not found
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense
    });
  } catch (error: any) {
    console.error(
      "Update expense error:",
      error
    );

    return res.status(400).json({
      success: false,
      message:
        error.message || "Failed to update expense"
    });
  }
};


export const deleteExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      farmId,
      expenseId
    } = req.params;

    const userId = (req as any).user.id;

    // Validate IDs
    if (
      !farmId ||
      Array.isArray(farmId) ||
      !expenseId ||
      Array.isArray(expenseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID or expense ID"
      });
    }

    // Delete expense
    const expense = await deleteExpenseService(
      farmId,
      expenseId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      expense
    });
  } catch (error: any) {
    console.error(
      "Delete expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error"
    });
  }
};


export const getTopExpenses = async (
  req: Request,
  res: Response
) => {
  try {
    const { farmId } = req.params;
    const userId = (req as any).user.id;
    const { k } = req.query;

    // Validate farm ID
    if (!farmId || Array.isArray(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID"
      });
    }

    // Validate k
    if (!k || Array.isArray(k)) {
      return res.status(400).json({
        success: false,
        message: "k is required"
      });
    }

    const limit = Number(k);

    // k must be a positive integer
    if (
      !Number.isInteger(limit) ||
      limit <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "k must be a positive integer"
      });
    }

    // Get top expenses
    const topExpenses =
      await getTopExpensesService(
        farmId,
        userId,
        limit
      );

    return res.status(200).json({
      success: true,
      message: "Top expenses fetched successfully",
      count: topExpenses.length,
      k: limit,
      top_expenses: topExpenses
    });
  } catch (error: any) {
    console.error(
      "Get top expenses error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error"
    });
  }
};