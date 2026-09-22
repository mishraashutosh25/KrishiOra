import { Router } from "express";

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  getTopExpenses,
  deleteExpense,
  getAllUserExpenses,
  createUserExpense,
} from "../controllers/expense.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Global User-Wide Expense Routes
router.get(
  "/",
  authMiddleware,
  getAllUserExpenses
);

router.post(
  "/",
  authMiddleware,
  createUserExpense
);

// Specific Expense Operations
router.get(
  "/:expenseId",
  authMiddleware,
  getExpenseById
);

router.patch(
  "/:expenseId",
  authMiddleware,
  updateExpense
);

router.delete(
  "/:expenseId",
  authMiddleware,
  deleteExpense
);

// Farm-Scoped Routes for backwards compatibility
router.post(
  "/:farmId/expenses",
  authMiddleware,
  createExpense
);

router.patch(
  "/:farmId/expenses/:expenseId",
  authMiddleware,
  updateExpense
);

router.get(
  "/:farmId/expenses",
  authMiddleware,
  getExpenses
);

router.get(
  "/:farmId/expenses/top",
  authMiddleware,
  getTopExpenses
);

router.get(
  "/:farmId/expenses/:expenseId",
  authMiddleware,
  getExpenseById
);

router.delete(
  "/:farmId/expenses/:expenseId",
  authMiddleware,
  deleteExpense
);

export default router;