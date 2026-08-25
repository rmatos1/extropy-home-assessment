type MonthlyReport = {
  month: string;
  total: number;
  categories: {
    categoryId: string;
    total: number;
  }[];
};

export type SpendingReport = MonthlyReport[];
