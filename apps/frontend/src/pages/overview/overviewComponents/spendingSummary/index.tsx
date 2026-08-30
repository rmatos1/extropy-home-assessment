import { currencyFormatter } from "../../../../helpers";

type SpendingSummaryProps = {
  totalThisMonth: number;
  totalThisYear: number;
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

export function SpendingSummary({
  totalThisMonth,
  totalThisYear,
}: SpendingSummaryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <SpendingCard title="This month" value={totalThisMonth} />

      <SpendingCard title="This year" value={totalThisYear} />
    </div>
  );
}
