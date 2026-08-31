import { useLoaderData } from "react-router";

import { overviewLoader } from "../../router/loaders";

import {
  MonthlySpending,
  RecentExpenses,
  SpendingByCategory,
  SpendingSummary,
} from "./overviewComponents";

export function Overview() {
  const [categories, reports] = useLoaderData<typeof overviewLoader>();

  return (
    <div className="flex h-full flex-1 flex-col gap-6 p-4">
      <SpendingSummary
        totalThisMonth={reports?.totalThisMonth ?? 0}
        totalThisYear={reports?.totalThisYear ?? 0}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlySpending data={reports?.monthlySpending ?? []} />
        <SpendingByCategory
          data={reports?.spendingByCategory ?? []}
          categories={categories}
        />
      </div>

      <RecentExpenses expenses={reports?.recentExpenses ?? []} />
    </div>
  );
}
