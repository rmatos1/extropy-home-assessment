import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type SpendingByCategoryData = {
  categoryId: string;
  categoryName: string;
  amount: number;
};

type SpendingByCategoryProps = {
  data: SpendingByCategoryData[];
};

export function SpendingByCategory({ data }: SpendingByCategoryProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">
        Spending by category
      </h3>

      <div className="mt-4 h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="categoryName"
                cx="50%"
                cy="50%"
                outerRadius="70%"
                label
              >
                {data.map((entry) => (
                  <Cell key={entry.categoryId} />
                ))}
              </Pie>

              <Tooltip />
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
