import type { ExpenseResponse } from "@extropy/shared";

import type { SpendingReport } from "./reports.types";
import { getExpenses } from "../expenses/expenses.services";

export async function getSpendingReport(
  userId: string
): Promise<SpendingReport> {
  const expenses = await getExpenses({
    userId,
  });

  if (expenses.length === 0) {
    return {
      totalThisMonth: 0,
      totalThisYear: 0,
      monthlySpending: [],
      spendingByCategory: [],
      recentExpenses: [],
    };
  }

  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");

  const currentMonthKey = `${currentYear}-${currentMonth}`;

  const currentYearPrefix = `${currentYear}-`;

  let totalThisMonth = 0;
  let totalThisYear = 0;

  const monthlyTotals: Record<string, number> = {};
  const categoryTotals: Record<
    string,
    {
      categoryName: string;
      amount: number;
    }
  > = {};

  for (const expense of expenses) {
    const { amount, categoryId, categoryName, date } = expense;

    const month = date.slice(0, 7);

    monthlyTotals[month] = (monthlyTotals[month] ?? 0) + amount;

    if (date.startsWith(currentMonthKey)) {
      totalThisMonth += amount;
    }

    if (date.startsWith(currentYearPrefix)) {
      totalThisYear += amount;
    }

    if (!categoryTotals[categoryId]) {
      categoryTotals[categoryId] = {
        categoryName,
        amount: 0,
      };
    }

    categoryTotals[categoryId].amount += amount;
  }

  const monthlySpending = Object.entries(monthlyTotals)
    .sort(([monthA], [monthB]) => monthB.localeCompare(monthA))
    .map(([month, amount]) => ({
      month,
      amount,
    }));

  const spendingByCategory = Object.entries(categoryTotals).map(
    ([categoryId, data]) => ({
      categoryId,
      categoryName: data.categoryName,
      amount: data.amount,
    })
  );

  const recentExpenses = [...expenses]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return {
    totalThisMonth,
    totalThisYear,
    monthlySpending,
    spendingByCategory,
    recentExpenses,
  };
}
