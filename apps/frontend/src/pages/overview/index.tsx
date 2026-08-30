import { useLoaderData } from "react-router";

import { overviewLoader } from "../../router/loaders";

import {
  MonthlySpending,
  RecentExpenses,
  SpendingByCategory,
  SpendingSummary,
} from "./overviewComponents";

export function Overview() {
  const data = useLoaderData<typeof overviewLoader>();

  return (
    <div className="flex flex-col gap-6 p-4">
      <SpendingSummary
        totalThisMonth={data?.totalThisMonth ?? 0}
        totalThisYear={data?.totalThisYear ?? 0}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlySpending data={data?.monthlySpending ?? []} />
        <SpendingByCategory data={data?.spendingByCategory ?? []} />
      </div>

      <RecentExpenses expenses={data?.recentExpenses ?? []} />
    </div>
  );
}
