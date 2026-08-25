import { Router } from "express";

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  getTopExpenses,
  deleteExpense
} from "../controllers/expense.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

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