import type { ActionFunctionArgs } from "react-router";
import type { Expense } from "@extropy/shared";

import { createExpense, updateExpense, deleteExpense } from "../../../services";

export async function expenseActions({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const intent = formData.get("intent");

  try {
    if (intent === "create" || intent === "update") {
      const expense: Expense = {
        amount: Number(String(formData.get("amount") ?? "").replace(",", ".")),
        description: String(formData.get("description") ?? ""),
        categoryId: String(formData.get("categoryId") ?? ""),
        date: String(formData.get("date") ?? ""),
      };

      if (intent === "create") {
        await createExpense(expense);
      } else {
        const expenseId = String(formData.get("expenseId") ?? "");

        if (!expenseId) {
          return {
            error: "Expense ID is required.",
          };
        }

        await updateExpense(expenseId, expense);
      }

      return {
        success: true,
        operation: intent,
        message: `Expense ${
          intent === "create" ? "added" : "updated"
        } successfully!`,
      };
    }

    if (intent === "delete") {
      const expenseId = String(formData.get("expenseId") ?? "");

      if (!expenseId) {
        return {
          error: "Expense ID is required.",
        };
      }

      await deleteExpense(expenseId);

      return {
        success: true,
        operation: "delete",
        message: "Expense deleted successfully!",
      };
    }

    return {
      error: "Invalid action.",
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.",
    };
  }
}
