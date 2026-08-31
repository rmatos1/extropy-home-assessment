import { useState, useMemo, useRef, useEffect } from "react";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import toast from "react-hot-toast";
import type { ExpenseResponse } from "@extropy/shared";

import { expensesLoader } from "../../router/loaders";

import { getColumns, initialExpenseData } from "./expenses.constants";
import type { ExpenseFormData } from "./expenses.types";

export const useExpensesHelper = () => {
  const expensesFetcher = useFetcher();
  const expensesFormRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseFormData, setExpenseFormData] =
    useState<ExpenseFormData>(initialExpenseData);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );

  const { categories, expenses } = useLoaderData<typeof expensesLoader>();

  const isProcessing = expensesFetcher.state === "submitting";
  const isLoading =
    navigation.state === "loading" &&
    navigation.location?.pathname === "/expenses";

  const deleteExpenseDescription = useMemo(() => {
    if (!showDeleteModal) {
      return "";
    }

    return (
      expenses?.find((item: ExpenseResponse) => item.id === selectedExpenseId)
        ?.description ?? ""
    );
  }, [selectedExpenseId, showDeleteModal, expenses]);

  const columns = useMemo(() => {
    const categoryMap = new Map(
      categories.map((category) => [category.id, category.name])
    );

    return getColumns(categoryMap);
  }, [categories]);

  useEffect(() => {
    if (expensesFetcher.data?.error) {
      toast.error(expensesFetcher.data.error);
      return;
    }

    if (expensesFetcher.data?.success) {
      toast.success(expensesFetcher.data.message);
      expensesFormRef.current?.reset();
    }

    if (expensesFetcher.data?.operation === "update") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditing(false);
    }

    if (expensesFetcher.data?.operation === "delete") {
       
      setShowDeleteModal(false);
      setSelectedExpenseId(null);
    }
  }, [expensesFetcher.data]);

  const onClickAddExpense = () => {
    setExpenseFormData(initialExpenseData);
    setIsAdding(true);
  };

  const onClickEditExpense = (expense: ExpenseResponse) => {
    const { id, date, description, categoryId, amount } = expense;

    setIsEditing(true);
    setSelectedExpenseId(id);

    setExpenseFormData({
      date,
      description,
      categoryId,
      amount: amount.toFixed(2),
    });
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

  const onClickDeleteExpense = (expense: ExpenseResponse) => {
    setIsEditing(false);
    setSelectedExpenseId(expense.id);
    setShowDeleteModal(true);
  };

  const onCloseModal = () => {
    setSelectedExpenseId(null);
    setShowDeleteModal(false);
  };

  const onConfirmDelete = () => {
    console.log("selectedId", selectedExpenseId);
    if (!selectedExpenseId) {
      return;
    }

    expensesFetcher.submit(
      {
        intent: "delete",
        expenseId: selectedExpenseId,
      },
      {
        method: "post",
        action: "/expenses",
      }
    );
  };

  return {
    expensesFetcher,
    expensesFormRef,
    isAdding,
    onClickAddExpense,
    isEditing,
    isProcessing,
    expenses,
    categories,
    expenseFormData,
    selectedExpenseId,
    onClickEditExpense,
    onCancelExpenseForm,
    onClickDeleteExpense,
    showDeleteModal,
    deleteExpenseDescription,
    onCloseModal,
    onConfirmDelete,
    columns,
    isLoading,
  };
};
