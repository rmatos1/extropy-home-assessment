import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useFetcher } from "react-router";
import type { Category, CategoryResponse } from "@extropy/shared";

export const columns: Array<ColumnDef<typeof features, ExpenseProps>> = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue<string>(),
  },
];

export const useCategoriesHelper = () => {
  const categoryFetcher = useFetcher();

  const [isAdding, setIsAdding] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<string>("");

  const customCategories: CategoryResponse[] = [
    {
      id: "1",
      name: "Bills",
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "2",
      name: "Food",
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "3",
      name: "Enternaiment",
      createdAt: "",
      updatedAt: "",
    },
  ];

  const isSaving = categoryFetcher.state === "submitting";

  const onClickAddCategory = () => {
    setIsAdding(true);
  };

  const onChangeNewCategory = (value: string) => {
    setNewCategoryName(value);
  };

  const onSubmitCategory = () => {
    categoryFetcher.submit(
      {
        intent: "create",
        name: newCategoryName,
      },
      {
        method: "post",
      }
    );
  };

  const onCancelCategoryForm = () => {
    setIsAdding(false);
  };

  return {
    isAdding,
    newCategoryName,
    customCategories,
    isSaving,
    onClickAddCategory,
    onChangeNewCategory,
    onCancelCategoryForm,
    onSubmitCategory,
  };
};
