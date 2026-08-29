import { useState, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFetcher } from "react-router";
import type { Expense, ExpenseResponse } from "@extropy/shared";

import { currencyFormatter } from "../../helpers";

export const columns: Array<ColumnDef<typeof features, ExpenseProps>> = [
  {
    accessorKey: "date",
    header: "Date",
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: (info) => info.getValue<string>(),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: (info) => {
      const amount = info.getValue<number>();

      return currencyFormatter.format(amount);
    },
  },
];

const initialExpenseData: Expense = {
  date: new Date().toISOString().slice(0, 10),
  description: "",
  categoryId: "",
  amount: "",
};

export const useExpensesHelper = () => {
  const expenseFetcher = useFetcher();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseFormData, setExpenseFormData] =
    useState<Expense>(initialExpenseData);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );

  const expenses: ExpenseResponse[] = [
    {
      id: "1",
      date: "2026-08-25",
      description: "Electricity",
      categoryId: "bills",
      amount: 24800,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "2",
      date: "2026-08-12",
      description: "Restaurant",
      categoryId: "food",
      amount: 12000,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "3",
      date: "2026-08-05",
      description: "Groceries",
      categoryId: "food",
      amount: 57900,
      createdAt: "",
      updatedAt: "",
    },
  ];

  const isSaving = expenseFetcher.state === "submitting";

  const deleteExpenseDescription = useMemo(() => {
    if (!showDeleteModal) {
      return "";
    }

    return expenses.find(
      (item: ExpenseResponse) => item.id === selectedExpenseId
    ).description;
  }, [selectedExpenseId, showDeleteModal, expenses]);

  const onClickAddExpense = () => {
    setIsAdding(true);
  };

  const onClickEditExpense = (expense: Expense) => {
    setIsEditing(true);
    setSelectedExpenseId(expense.id);

    setExpenseFormData({
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: (expense.amount / 100).toFixed(2),
    });
  };

  const onChangeFormData = (field: keyof Expense, value: string) => {
    setExpenseFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const onSubmitExpense = () => {
    const { date, description, categoryId, amount } = expenseFormData;

    expenseFetcher.submit(
      {
        intent: isEditing ? "update" : "create",
        expenseId: selectedExpenseId,
        date,
        description,
        categoryId,
        amount,
      },
      {
        method: isEditing ? "put" : "post",
      }
    );

    if (isEditing) {
      setIsEditing(false);
    }
  };

  const onCancelExpenseForm = () => {
    if (isEditing) {
      setIsEditing(false);
      setSelectedExpenseId(null);
    } else {
      setIsAdding(false);
    }

    setExpenseFormData(initialExpenseData);
  };

  const onClickDeleteExpense = (expense: Expense) => {
    setIsEditing(false);
    setSelectedExpenseId(expense.id);
    setShowDeleteModal(true);
  };

  const onCloseModal = () => {
    setSelectedExpenseId(null);
    setShowDeleteModal(false);
  };

  const onConfirmDelete = () => {
    return;
  };

  return {
    isAdding,
    onClickAddExpense,
    isEditing,
    isSaving,
    expenses,
    expenseFormData,
    selectedExpenseId,
    onClickEditExpense,
    onChangeFormData,
    onSubmitExpense,
    onCancelExpenseForm,
    onClickDeleteExpense,
    showDeleteModal,
    deleteExpenseDescription,
    onCloseModal,
    onConfirmDelete,
  };
};
