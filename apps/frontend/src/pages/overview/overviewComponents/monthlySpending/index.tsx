import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type MonthlySpendingData = {
  month: string;
  amount: number;
};

type MonthlySpendingProps = {
  data: MonthlySpendingData[];
};

export function MonthlySpending({ data }: MonthlySpendingProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Monthly spending</h3>

      <div className="mt-4 h-80">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            There isn't any spending data yet.
          </div>
        )}
      </div>
    </section>
  );
}
