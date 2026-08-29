import { currencyFormatter } from "../../../../helpers";

export function RecentExpenses() {
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
            <tr className="border-b border-gray-100">
              <td className="px-2 py-3 text-sm text-gray-700">08/25/2026</td>
              <td className="px-2 py-3 text-sm text-gray-700">Bills</td>
              <td className="px-2 py-3 text-right text-sm font-medium text-gray-900">
                {currencyFormatter.format(248)}
              </td>
            </tr>

            <tr className="border-b border-gray-100">
              <td className="px-2 py-3 text-sm text-gray-700">08/12/2026</td>
              <td className="px-2 py-3 text-sm text-gray-700">Restaurant</td>
              <td className="px-2 py-3 text-right text-sm font-medium text-gray-900">
                {currencyFormatter.format(120)}
              </td>
            </tr>

            <tr>
              <td className="px-2 py-3 text-sm text-gray-700">08/05/2026</td>
              <td className="px-2 py-3 text-sm text-gray-700">Groceries</td>
              <td className="px-2 py-3 text-right text-sm font-medium text-gray-900">
                {currencyFormatter.format(579)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
