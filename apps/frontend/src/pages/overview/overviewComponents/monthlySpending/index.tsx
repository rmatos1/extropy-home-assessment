import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { month: "Aug 2026", amount: 1250 },
  { month: "Jul 2026", amount: 850 },
  { month: "Jun 2026", amount: 620 },
  { month: "May 2026", amount: 940 },
];

export function MonthlySpending() {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Monthly spending</h3>

      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
