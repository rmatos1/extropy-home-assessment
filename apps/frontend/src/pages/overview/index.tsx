import {
  MonthlySpending,
  RecentExpenses,
  SpendingByCategory,
  SpendingSummary,
} from "./overviewComponents";

export function Overview() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <SpendingSummary />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MonthlySpending />
        <SpendingByCategory />
      </div>

      <RecentExpenses />
    </div>
  );
}
