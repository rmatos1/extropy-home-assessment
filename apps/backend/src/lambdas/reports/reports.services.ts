import type { SpendingReport } from "./reports.types";
import { sortMonthsDescending } from "./reports.helpers";
import { getExpenses } from "../expenses/expenses.services";

export async function getSpendingReport(
  userId: string
): Promise<SpendingReport> {
  const expenses = await getExpenses({
    userId,
  });

  const monthlyTotals: Record<
    string,
    {
      total: number;
      categories: Record<string, number>;
    }
  > = {};

  for (const expense of expenses) {
    const { amount, categoryId, date } = expense;

    const month = date.slice(0, 7);

    if (!monthlyTotals?.[month]) {
      monthlyTotals[month] = {
        total: 0,
        categories: {},
      };
    }

    monthlyTotals[month].total += amount;

    if (!monthlyTotals[month].categories?.[categoryId]) {
      monthlyTotals[month].categories[categoryId] = 0;
    }

    monthlyTotals[month].categories[categoryId] += amount;
  }

  return Object.entries(monthlyTotals)
    .sort(sortMonthsDescending)
    .map(([month, data]) => ({
      month,
      total: data.total,
      categories: Object.entries(data.categories).map(
        ([categoryId, total]) => ({
          categoryId,
          total,
        })
      ),
    }));
}
