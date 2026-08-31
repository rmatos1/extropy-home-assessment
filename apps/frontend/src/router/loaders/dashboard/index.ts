import type { LoaderFunctionArgs } from "react-router";

import type { SpendingReportResponse } from "@extropy/shared";

import {
  getSpendingReport,
  getExpenses,
  getCategories,
} from "../../../services";

export function overviewLoader(): Promise<SpendingReportResponse> {
  return Promise.all([getCategories(), getSpendingReport()]);
}

export async function expensesLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);

  const [categories, expenses] = await Promise.all([
    getCategories(),
    getExpenses({
      startDate: url.searchParams.get("startDate") ?? undefined,
      endDate: url.searchParams.get("endDate") ?? undefined,
      categoryId: url.searchParams.get("categoryId") ?? undefined,
    }),
  ]);

  return { categories, expenses };
}

export function categoriesLoader() {
  return getCategories();
}
