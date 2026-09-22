import { Request, Response } from "express";

import {
  createExpenseService,
  verifyFarmOwnership,
  getExpensesService,
  getExpenseByIdService,
  updateExpenseService,
  deleteExpenseService,
  getTopExpensesService,
  getUserAllExpensesService,
} from "../services/expense.service";
import { supabaseAdmin } from "../config/supabase";

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

    const targetExpenseId = expenseId || farmId;
    const userId = (req as any).user.id;

    if (!targetExpenseId || Array.isArray(targetExpenseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID"
      });
    }

    let query = supabaseAdmin
      .from("expenses")
      .select("*, farms:farm_id (id, farm_name, area, area_unit), crops:crop_id (id, crop_name)")
      .eq("id", targetExpenseId)
      .eq("user_id", userId);

    if (farmId && expenseId) {
      query = query.eq("farm_id", farmId);
    }

    const { data: expense, error } = await query.maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch expense"
      });
    }

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

    const targetExpenseId = expenseId || farmId;
    const userId = (req as any).user.id;

    if (!targetExpenseId || Array.isArray(targetExpenseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID"
      });
    }

    if (
      !req.body ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

    // Check existing expense
    let query = supabaseAdmin
      .from("expenses")
      .select("*")
      .eq("id", targetExpenseId)
      .eq("user_id", userId);

    if (farmId && expenseId) {
      query = query.eq("farm_id", farmId);
    }

    const { data: existingExpense, error: fetchErr } = await query.maybeSingle();

    if (fetchErr || !existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or unauthorized"
      });
    }

    const quantity = req.body.quantity !== undefined ? Number(req.body.quantity) : existingExpense.quantity;
    const unit_price = req.body.unit_price !== undefined ? Number(req.body.unit_price) : existingExpense.unit_price;
    const total_amount = quantity * unit_price;

    const updatePayload: any = {
      ...req.body,
      quantity,
      unit_price,
      total_amount
    };
    delete updatePayload.id;
    delete updatePayload.user_id;

    const { data: updatedExpense, error: updateError } = await supabaseAdmin
      .from("expenses")
      .update(updatePayload)
      .eq("id", targetExpenseId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        success: false,
        message: updateError.message || "Failed to update expense"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense
    });
  } catch (error: any) {
    console.error(
      "Update expense error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message || "Internal server error"
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

    const targetExpenseId = expenseId || farmId;
    const userId = (req as any).user.id;

    if (!targetExpenseId || Array.isArray(targetExpenseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense ID"
      });
    }

    let query = supabaseAdmin
      .from("expenses")
      .select("*")
      .eq("id", targetExpenseId)
      .eq("user_id", userId);

    if (farmId && expenseId) {
      query = query.eq("farm_id", farmId);
    }

    const { data: existing, error: fetchErr } = await query.maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or unauthorized"
      });
    }

    const { error: deleteErr } = await supabaseAdmin
      .from("expenses")
      .delete()
      .eq("id", targetExpenseId)
      .eq("user_id", userId);

    if (deleteErr) {
      return res.status(500).json({
        success: false,
        message: deleteErr.message || "Failed to delete expense"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      expense: existing
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

export const getAllUserExpenses = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;
    const {
      category,
      payment_status,
      payment_method,
      from_date,
      to_date
    } = req.query;

    const result = await getUserAllExpensesService(
      userId,
      category as string | undefined,
      payment_status as string | undefined,
      payment_method as string | undefined,
      from_date as string | undefined,
      to_date as string | undefined
    );

    return res.status(200).json({
      success: true,
      message: "Expenses fetched successfully",
      ...result
    });
  } catch (error: any) {
    console.error("Get all user expenses error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

export const createUserExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const userId = (req as any).user.id;
    let farmId = req.body.farm_id;

    if (!farmId) {
      let { data: farm } = await supabaseAdmin
        .from("farms")
        .select("id")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!farm) {
        // Auto-provision a default farm so user expense creation is seamless
        const { data: newFarm, error: farmCreateError } = await supabaseAdmin
          .from("farms")
          .insert({
            user_id: userId,
            farm_name: "My Main Farm",
            location: "Primary Farm Area",
            area: 5,
            area_unit: "acres",
            soil_type: "Alluvial Soil",
            irrigation_type: "Tube-well / Borewell",
            ownership_type: "Self-Owned"
          })
          .select("id")
          .single();

        if (farmCreateError || !newFarm) {
          console.error("Auto farm creation error:", farmCreateError);
          return res.status(500).json({
            success: false,
            message: "Failed to initialize default farm: " + (farmCreateError?.message || "")
          });
        }
        farm = newFarm;
      }
      farmId = farm.id;
    }

    const {
      crop_id,
      category,
      item_name,
      description,
      quantity,
      unit,
      unit_price,
      expense_date,
      payment_status = "PAID",
      payment_method,
      notes
    } = req.body;

    if (!category || !item_name || quantity === undefined || !unit || unit_price === undefined) {
      return res.status(400).json({
        success: false,
        message: "Required expense fields (category, item_name, quantity, unit, unit_price) are missing"
      });
    }

    const expense = await createExpenseService({
      user_id: userId,
      farm_id: farmId,
      crop_id,
      category,
      item_name,
      description,
      quantity: Number(quantity),
      unit,
      unit_price: Number(unit_price),
      expense_date: expense_date || new Date().toISOString().split("T")[0],
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
    console.error("Create user expense error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};