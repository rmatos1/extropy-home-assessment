import type { ExpenseResponse } from "@extropy/shared";

import { currencyFormatter, formatDate } from "../../../../helpers";

type RecentExpensesProps = {
  expenses: ExpenseResponse[];
};

type CustomTdProps = {
  label: string;
  value: string;
};

const CustomTd = ({ label, value }: CustomTdProps) => (
  <td
    data-label={label}
    className="
              px-2 py-3 text-sm text-gray-700
              max-[480px]:flex max-[480px]:flex-col max-[480px]:items-start max-[480px]:px-2 max-[480px]:py-2
              max-[480px]:before:font-medium
              max-[480px]:before:text-gray-500
              max-[480px]:before:content-[attr(data-label)]
            "
  >
    {value}
  </td>
);

export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Recent expenses</h3>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="max-[480px]:hidden">
            <tr className="border-b border-gray-200">
              <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">
                Date
              </th>

              <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">
                Expense
              </th>

              <th className="px-2 py-3 text-left text-sm font-medium text-gray-500">
                Amount
              </th>
            </tr>
          </thead>

          <tbody>
            {expenses.length > 0 ? (
              expenses.map((item) => (
                <tr
                  className="border-b border-gray-100 max-[480px]:flex max-[480px]:flex-col max-[480px]:py-3"
                  key={item.id}
                >
                  <CustomTd label="Date" value={formatDate(item.date)} />

                  <CustomTd label="Expense" value={item.description} />

                  <CustomTd
                    label="Amount"
                    value={currencyFormatter.format(item.amount)}
                  />
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
