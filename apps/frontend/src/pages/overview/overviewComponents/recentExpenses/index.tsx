import type { ExpenseResponse } from "@extropy/shared";

import { currencyFormatter } from "../../../../helpers";

type RecentExpensesProps = {
  expenses: ExpenseResponse[];
};

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Recent expenses</h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">
                Date
              </th>

              <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">
                Expense
              </th>

              <th className="px-2 py-3 text-right text-sm font-medium text-gray-500">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {expenses.length > 0 ? (
              expenses.map((item: ExpenseResponse) => (
                <tr className="border-b border-gray-100" key={item.id}>
                  <td className="px-2 py-3 text-sm text-gray-700">
                    {item.date}
                  </td>

                  <td className="px-2 py-3 text-sm text-gray-700">
                    {item.categoryName}
                  </td>

                  <td className="px-2 py-3 text-right text-sm font-medium text-gray-900">
                    {currencyFormatter.format(item.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-2 py-3 text-center text-sm text-gray-500"
                  colSpan={3}
                >
                  There aren't any recent expenses.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
