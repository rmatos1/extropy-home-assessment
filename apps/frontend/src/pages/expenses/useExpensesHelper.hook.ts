import { useState, useMemo } from "react";
import { useFetcher, useLoaderData } from "react-router";
import type { Expense, ExpenseResponse } from "@extropy/shared";

import { expensesLoader } from "../../router/loaders";

import { initialExpenseData } from "./expenses.constants";

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

  const expenses: ExpenseResponse[] = useLoaderData<typeof expensesLoader>();

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
