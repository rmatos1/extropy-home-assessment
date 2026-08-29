import { currencyFormatter } from "../../../../helpers";

type SpendingCardProps = {
  title: string;
  value: number;
};

function SpendingCard({ title, value }: SpendingCardProps) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-gray-900">
        {currencyFormatter.format(value)}
      </p>
    </div>
  );
}

export function SpendingSummary() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SpendingCard title="This month" value={1435} />

      <SpendingCard title="This year" value={12850} />
    </section>
  );
}
