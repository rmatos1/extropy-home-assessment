import { useEffect, useState, useRef } from "react";
import { useFetcher, useLoaderData, useNavigation } from "react-router";
import toast from "react-hot-toast";

import type { Category } from "@extropy/shared";

import { categoriesLoader } from "../../router/loaders";

export const useCategoriesHelper = () => {
  const categoriesFetcher = useFetcher();
  const categoriesFormRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();

  const [isAdding, setIsAdding] = useState(false);

  const categories: Category[] = useLoaderData<typeof categoriesLoader>();

  const isSaving = categoriesFetcher.state === "submitting";
  const isLoading =
    navigation.state === "loading" &&
    navigation.location?.pathname === "/categories";

  useEffect(() => {
    if (categoriesFetcher.data?.error) {
      toast.error(categoriesFetcher.data.error);
      return;
    }

    if (categoriesFetcher.data?.success) {
      toast.success(categoriesFetcher.data.message);
      categoriesFormRef.current?.reset();
    }
  }, [categoriesFetcher.data]);

  const onClickAddCategory = () => {
    setIsAdding(true);
  };

  const onCancelCategoryForm = () => {
    setIsAdding(false);
  };

  return {
    categoriesFetcher,
    categoriesFormRef,
    isAdding,
    categories,
    isSaving,
    onClickAddCategory,
    onCancelCategoryForm,
    isLoading,
  };
};
