export const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export const formatDate = (date: string) => {
  const [year, month, day] = date.split("-");

  return `${day}/${month}/${year}`;
};

export const formatMonth = (value: string) => {
  const [year, month] = value.split("-");

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "2-digit",
  }).format(new Date(Number(year), Number(month) - 1, 1));
};
