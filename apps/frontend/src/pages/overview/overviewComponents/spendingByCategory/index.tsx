import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { Category } from "@extropy/shared";

import { graphColors } from "../../overview.constants";
import { currencyFormatter } from "../../../../helpers";

type SpendingByCategoryData = {
  categoryId: string;
  amount: number;
};

type SpendingByCategoryProps = {
  data: SpendingByCategoryData[];
  categories: Category[];
};

export function SpendingByCategory({
  data,
  categories,
}: SpendingByCategoryProps) {
  const categoryMap = useMemo(
    () => new Map(categories?.map((category) => [category.id, category.name])),
    [categories]
  );

  const chartData = useMemo(
    () =>
      data?.map((item) => ({
        ...item,
        categoryName: categoryMap.get(item.categoryId) ?? item.categoryId,
      })),
    [data, categoryMap]
  );

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        Spending by category
      </h3>

      <div className="mt-4 h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="amount"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                label={({ categoryName, value }) =>
                  `${categoryName}: ${currencyFormatter.format(Number(value))}`
                }
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.categoryId}
                    fill={graphColors[index % graphColors.length]}
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(value) => currencyFormatter.format(Number(value))}
              />

              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            There isn't any spending by category yet.
          </div>
        )}
      </div>
    </section>
  );
}
