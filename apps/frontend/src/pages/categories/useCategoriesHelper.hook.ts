import { useEffect, useState, useRef, HTMLFormElement } from "react";
import { useNavigation, useLoaderData, useActionData } from "react-router";
import toast from "react-hot-toast";

import type { Category } from "@extropy/shared";

import { categoriesLoader } from "../../router/loaders";

export const useCategoriesHelper = () => {
  const categoriesFormRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const actionData = useActionData<typeof categoriesAction>();

  const [isAdding, setIsAdding] = useState(false);

  const categories: Category[] = useLoaderData<typeof categoriesLoader>();

  const isSaving = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
      return;
    }

    if (actionData?.success) {
      toast.success(actionData.message);
      categoriesFormRef.current?.reset();
    }
  }, [actionData]);

  const onClickAddCategory = () => {
    setIsAdding(true);
  };

  const onCancelCategoryForm = () => {
    setIsAdding(false);
  };

  return {
    categoriesFormRef,
    isAdding,
    categories,
    isSaving,
    onClickAddCategory,
    onCancelCategoryForm,
  };
};
